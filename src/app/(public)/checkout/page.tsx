'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/layout/AuthContext';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { getUserFacingErrorMessage } from '@/lib/utils/userFacingError';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;
const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

type ShippingQuote = {
  shippingPrice: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
};

function parseCartItemId(id: string): { productId: string; variantId: string } | null {
  const idx = id.lastIndexOf('-');
  if (idx <= 0 || idx === id.length - 1) return null;
  return {
    productId: id.slice(0, idx),
    variantId: id.slice(idx + 1),
  };
}

function CheckoutPaymentForm({ orderId }: { orderId: string }) {
  const t = useTranslations('checkout');
  const stripe = useStripe();
  const elements = useElements();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${encodeURIComponent(orderId)}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || t('errors.checkoutFailed'));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <PrimaryButton
        onClick={() => {}}
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full py-4"
      >
        {isSubmitting ? <Spinner size="sm" colorScheme="light" /> : t('actions.pay')}
      </PrimaryButton>
    </form>
  );
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const { items, getSubtotal, promoDiscount } = useCart();
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [country, setCountry] = useState('IT');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [province, setProvince] = useState('');

  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();

  const checkoutItemsInfo = useMemo(() => {
    const parsed = items
      .map((i) => {
        const res = parseCartItemId(i.id);
        if (!res) return null;
        return { productId: res.productId, variantId: res.variantId, quantity: i.quantity };
      })
      .filter(Boolean) as Array<{ productId: string; variantId: string; quantity: number }>;

    return {
      checkoutItems: parsed,
      hasUnparseableItems: parsed.length !== items.length,
    };
  }, [items]);

  const checkoutItems = checkoutItemsInfo.checkoutItems;

  const cartFingerprint = useMemo(() => {
    return JSON.stringify(
      checkoutItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    );
  }, [checkoutItems]);

  const [idempotencyKey] = useState(() => {
    const storageKey = 'checkout_idempotency_v1';

    try {
      const existingRaw = sessionStorage.getItem(storageKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw) as { key?: string; fingerprint?: string };
        if (
          parsed?.key &&
          typeof parsed.key === 'string' &&
          parsed.key.length >= 8 &&
          parsed.fingerprint === cartFingerprint
        ) {
          return parsed.key;
        }
      }
    } catch {
      // ignore
    }

    const uuid = globalThis.crypto?.randomUUID?.();
    const newKey = uuid || `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ key: newKey, fingerprint: cartFingerprint }),
      );
    } catch {
      // ignore
    }

    return newKey;
  });

  if (!items.length) {
    return (
      <div className="max-w-[900px] mx-auto px-6 md:px-8 lg:px-10 py-10">
        <h1 className="heading-default heading-sm lg:heading-lg mb-6">{t('title')}</h1>
        <p className="text-text-muted mb-6">{t('errors.emptyCart')}</p>
        <Link href="/prodotti">
          <PrimaryButton onClick={() => {}} className="px-8 py-4">
            {t('misc.backToCatalog')}
          </PrimaryButton>
        </Link>
      </div>
    );
  }

  const canQuote = country.trim() && postalCode.trim();
  const canCreate =
    email.trim() &&
    name.trim() &&
    country.trim() &&
    city.trim() &&
    postalCode.trim() &&
    address1.trim() &&
    !isCreating;

  const canProceed =
    canCreate &&
    !checkoutItemsInfo.hasUnparseableItems &&
    checkoutItems.length > 0 &&
    isStripeConfigured &&
    !clientSecret &&
    !orderId;

  const handleQuote = async () => {
    setIsQuoting(true);
    setError(null);

    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({
          address: { country, postalCode },
          items: checkoutItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(getUserFacingErrorMessage(data?.error, t('errors.checkoutFailed')));
      }

      setQuote(data.quote);
    } catch (e: any) {
      setError(e?.message || t('errors.checkoutFailed'));
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCreateIntent = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: getCsrfHeaders({
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        }),
        credentials: 'include',
        body: JSON.stringify({
          customer: {
            email,
            name,
            surname: surname || undefined,
            phone: phone || undefined,
          },
          address: {
            country,
            city,
            postalCode,
            addressLine1: address1,
            addressLine2: address2 || undefined,
            province: province || undefined,
          },
          marketingOptIn,
          items: checkoutItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        if (data?.errorCode === 'OUT_OF_STOCK') {
          const items = Array.isArray(data?.details?.items) ? data.details.items : [];
          const names = items
            .map((i: any) => i?.title)
            .filter(Boolean)
            .slice(0, 5)
            .join(', ');
          throw new Error(names ? `${t('errors.outOfStock')} (${names})` : t('errors.outOfStock'));
        }

        if (data?.errorCode === 'STRIPE_NOT_CONFIGURED') {
          throw new Error(t('errors.stripeNotConfigured'));
        }

        throw new Error(getUserFacingErrorMessage(data?.error, t('errors.checkoutFailed')));
      }

      if (!data.clientSecret || !data.orderId) {
        throw new Error(getUserFacingErrorMessage(data?.error, t('errors.checkoutFailed')));
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    } catch (e: any) {
      setError(e?.message || t('errors.checkoutFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  const totalForUi = quote?.total ?? Math.round((subtotal - (promoDiscount || 0)) * 100) / 100;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-10 py-10">
      <h1 className="heading-default heading-sm lg:heading-lg mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          {checkoutItemsInfo.hasUnparseableItems && (
            <div className="text-sm text-red-600" role="alert">
              {t('errors.checkoutFailed')}
            </div>
          )}

          <section className="bg-background-secondary rounded-[20px] p-6 lg:p-8">
            <h2 className="font-semibold text-xl mb-4">{t('contact.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-email" className="text-sm font-medium">
                  {t('contact.email')}
                </label>
                <input
                  id="checkout-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label htmlFor="checkout-name" className="text-sm font-medium">
                  {t('contact.name')}
                </label>
                <input
                  id="checkout-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label htmlFor="checkout-surname" className="text-sm font-medium">
                  {t('contact.surname')}
                </label>
                <input
                  id="checkout-surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-phone" className="text-sm font-medium">
                  {t('contact.phone')}
                </label>
                <input
                  id="checkout-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <label className="mt-4 flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
              />
              <span>{t('marketing.label')}</span>
            </label>
          </section>

          <section className="bg-background-secondary rounded-[20px] p-6 lg:p-8">
            <h2 className="font-semibold text-xl mb-4">{t('shipping.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-country" className="text-sm font-medium">
                  {t('shipping.country')}
                </label>
                <input
                  id="checkout-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label htmlFor="checkout-postalCode" className="text-sm font-medium">
                  {t('shipping.postalCode')}
                </label>
                <input
                  id="checkout-postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label htmlFor="checkout-city" className="text-sm font-medium">
                  {t('shipping.city')}
                </label>
                <input
                  id="checkout-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label htmlFor="checkout-province" className="text-sm font-medium">
                  {t('shipping.province')}
                </label>
                <input
                  id="checkout-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address1" className="text-sm font-medium">
                  {t('shipping.address1')}
                </label>
                <input
                  id="checkout-address1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-address2" className="text-sm font-medium">
                  {t('shipping.address2')}
                </label>
                <input
                  id="checkout-address2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <PrimaryButton
                onClick={handleQuote}
                disabled={!canQuote || isQuoting}
                className="px-5 py-3"
              >
                {isQuoting ? (
                  <Spinner size="sm" colorScheme="light" />
                ) : (
                  t('actions.calculateShipping')
                )}
              </PrimaryButton>
              {quote && (
                <div className="text-sm text-text-muted flex items-center">
                  {t('summary.shipping')}: € {quote.shippingPrice.toFixed(2)}
                </div>
              )}
            </div>
          </section>

          {error && (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background-secondary rounded-[20px] p-6 lg:p-8">
            <h2 className="font-semibold text-xl mb-6">{t('summary.title')}</h2>

            {!isStripeConfigured && (
              <div className="text-sm text-red-600 mb-4" role="alert">
                {t('errors.stripeNotConfigured')}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>{t('summary.subtotal')}</span>
                <span className="font-semibold">€ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>{t('summary.promo')}</span>
                <span>- € {(promoDiscount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>{t('summary.shipping')}</span>
                <span>€ {(quote?.shippingPrice ?? 0).toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-semibold">
                <span>{t('summary.total')}</span>
                <span>€ {totalForUi.toFixed(2)}</span>
              </div>
            </div>

            {!clientSecret || !orderId ? (
              <PrimaryButton
                onClick={handleCreateIntent}
                disabled={!canProceed || isCreating}
                className="w-full mt-8 py-4"
              >
                {isCreating ? <Spinner size="sm" colorScheme="light" /> : t('actions.continue')}
              </PrimaryButton>
            ) : (
              <div className="mt-8">
                {!stripePromise ? (
                  <div className="text-sm text-red-600" role="alert">
                    {t('errors.stripeNotConfigured')}
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: { theme: 'stripe' },
                    }}
                  >
                    <CheckoutPaymentForm orderId={orderId} />
                  </Elements>
                )}
              </div>
            )}

            <div className="mt-6 text-xs text-text-muted">{t('misc.securePayment')}</div>
          </div>

          <Link href="/cart" className="text-brand-dark hover:underline text-sm">
            {t('misc.backToCart')}
          </Link>
        </div>
      </div>
    </div>
  );
}
