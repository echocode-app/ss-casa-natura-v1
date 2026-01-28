'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

import SimpleBreadcrumbs from '@/components/ui/Breadcrumbs/SimpleBreadcrumbs';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/layout/AuthContext';
import AuthModal from '@/components/ui/Modal/AuthModal';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { getUserFacingErrorMessage } from '@/lib/utils/userFacingError';
import { checkoutFormSchema } from '@/lib/validation/schemas';
import { useDebounce } from '@/hooks/useDebounce';

import {
  CheckoutContactSection,
  CheckoutDeliverySection,
  CheckoutPaymentSection,
  CheckoutShippingMethodSection,
  CheckoutSummaryPanel,
  type ShippingMethod,
  type ShippingQuote,
} from './components/CheckoutSections';
import { Cart } from '@/components/ui/Buttons';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;
const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

function parseCartItemId(id: string): { productId: string; variantId: string } | null {
  const idx = id.lastIndexOf('-');
  if (idx <= 0 || idx === id.length - 1) return null;
  return {
    productId: id.slice(0, idx),
    variantId: id.slice(idx + 1),
  };
}

function getCartItemIdentity(item: { id: string; productId?: string; variantId?: string }): {
  productId: string;
  variantId: string;
} | null {
  if (item.productId && item.variantId) {
    return { productId: item.productId, variantId: item.variantId };
  }
  return parseCartItemId(item.id);
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const tValidation = useTranslations('validation');
  const tHeaderActions = useTranslations('header.actions');
  const tCart = useTranslations('user.cart');
  const { items, getSubtotal, promoDiscount } = useCart();
  const { user, isAuthenticated } = useAuth();

  const isCartEmpty = items.length === 0;

  const inputClassName =
    'w-full px-4 md:px-6 py-3 border rounded-input-xl ' +
    'h-[50px] md:h-[70px] ' +
    'text-[clamp(14px,3vw,24px)] font-variant-tabular ' +
    'text-text-extrablack bg-white border-input ' +
    'transition-colors duration-300 ' +
    'focus:outline-none focus:border-gray-600 ' +
    'hover:border-gray-600';

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');

  const [country, setCountry] = useState('IT');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [province, setProvince] = useState('');

  const [marketingOptIn, setMarketingOptIn] = useState(true);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('');

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const quoteAbortRef = useRef<AbortController | null>(null);
  const quoteSeqRef = useRef(0);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getSubtotal();

  const checkoutItemsInfo = useMemo(() => {
    const parsed = items
      .map((i) => {
        const res = getCartItemIdentity(i);
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

  const checkoutFingerprint = useMemo(() => {
    return JSON.stringify({
      items: checkoutItems.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      address: {
        country,
        city,
        postalCode,
        address1,
        address2,
        province,
        company,
      },
      shippingMethod,
    });
  }, [
    checkoutItems,
    address1,
    address2,
    city,
    company,
    country,
    postalCode,
    province,
    shippingMethod,
  ]);

  const [idempotencyKey, setIdempotencyKey] = useState(() => {
    const storageKey = 'checkout_idempotency_v1';

    try {
      const existingRaw = sessionStorage.getItem(storageKey);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw) as { key?: string; fingerprint?: string };
        if (
          parsed?.key &&
          typeof parsed.key === 'string' &&
          parsed.key.length >= 8 &&
          parsed.fingerprint === checkoutFingerprint
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
        JSON.stringify({ key: newKey, fingerprint: checkoutFingerprint }),
      );
    } catch {
      // ignore
    }

    return newKey;
  });

  // If any input impacting totals changes after we generated the key, we need a new key.
  // Otherwise Stripe/Order idempotency may reuse an intent created for different address/shipping.
  useEffect(() => {
    const storageKey = 'checkout_idempotency_v1';
    try {
      const existingRaw = sessionStorage.getItem(storageKey);
      if (!existingRaw) return;
      const parsed = JSON.parse(existingRaw) as { key?: string; fingerprint?: string };
      if (parsed?.fingerprint !== checkoutFingerprint) {
        const uuid = globalThis.crypto?.randomUUID?.();
        const newKey = uuid || `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ key: newKey, fingerprint: checkoutFingerprint }),
        );
        setIdempotencyKey(newKey);
        // Reloading the page would be heavy; just reset payment state.
        setClientSecret(null);
        setOrderId(null);
        setQuote(null);
        setQuoteError(null);
      }
    } catch {
      // ignore
    }
  }, [checkoutFingerprint]);

  const currentFormData = useMemo(
    () => ({
      email,
      name,
      surname,
      phone,
      country,
      company,
      addressLine1: address1,
      addressLine2: address2,
      postalCode,
      city,
      province,
      marketingOptIn,
      shippingMethod: shippingMethod || undefined,
    }),
    [
      address1,
      address2,
      city,
      company,
      country,
      email,
      marketingOptIn,
      name,
      phone,
      postalCode,
      province,
      shippingMethod,
      surname,
    ],
  );

  // Shipping quote/UI should not depend on "province" selection.
  // We still require enough address to compute a meaningful quote.
  const isAddressReadyForShipping = useMemo(() => {
    if (isCartEmpty) return false;

    const hasCountry = Boolean(country && country.trim());
    const hasPostalCode = Boolean(postalCode && postalCode.trim());
    const hasCity = Boolean(city && city.trim());
    const hasAddress1 = Boolean(address1 && address1.trim());

    return hasCountry && hasPostalCode && hasCity && hasAddress1;
  }, [address1, city, country, isCartEmpty, postalCode]);

  const canCreate = useMemo(() => {
    const parsed = checkoutFormSchema.safeParse({
      ...currentFormData,
      shippingMethod: shippingMethod || undefined,
    });
    return parsed.success && Boolean(shippingMethod) && !isCreating;
  }, [currentFormData, isCreating, shippingMethod]);

  const canProceed =
    canCreate &&
    !checkoutItemsInfo.hasUnparseableItems &&
    checkoutItems.length > 0 &&
    isStripeConfigured &&
    !clientSecret &&
    !orderId;

  const getInputClass = (field: string) => {
    const hasError = Boolean(touched[field] && fieldErrors[field]);
    return `${inputClassName} ${
      hasError ? 'border-red-500 focus:border-red-500 hover:border-red-500' : ''
    }`;
  };

  const validateField = (field: string, rawValue: unknown) => {
    const candidate: any = {
      ...currentFormData,
      shippingMethod: shippingMethod || undefined,
      [field]: rawValue,
    };

    const result = checkoutFormSchema.safeParse(candidate);
    const errorIssue = result.success
      ? null
      : result.error.issues.find((issue) => String(issue.path[0]) === field);
    const error = errorIssue ? tValidation(errorIssue.message) : '';

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });

    return !error;
  };

  const touchField = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateAll = () => {
    const result = checkoutFormSchema.safeParse({
      ...currentFormData,
      shippingMethod: shippingMethod || undefined,
    });

    const allTouched: Record<string, boolean> = {
      email: true,
      name: true,
      surname: true,
      phone: true,
      country: true,
      company: true,
      addressLine1: true,
      addressLine2: true,
      postalCode: true,
      city: true,
      province: true,
      shippingMethod: true,
    };
    setTouched((prev) => ({ ...prev, ...allTouched }));

    if (result.success) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.shippingMethod;
        return next;
      });
      return { valid: true, errors: {} };
    }

    const nextErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = String(issue.path[0] || 'general');
      nextErrors[field] = tValidation(issue.message);
    });

    if (!shippingMethod) {
      nextErrors.shippingMethod = tValidation('shippingMethodRequired');
    }

    setFieldErrors(nextErrors);
    return { valid: false, errors: nextErrors };
  };

  const handleQuote = async () => {
    if (!isAddressReadyForShipping) return;
    if (!checkoutItems.length) return;

    quoteAbortRef.current?.abort();
    const abortController = new AbortController();
    quoteAbortRef.current = abortController;

    const seq = ++quoteSeqRef.current;

    setIsQuoting(true);
    setQuoteError(null);

    try {
      const res = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        signal: abortController.signal,
        body: JSON.stringify({
          address: {
            country,
            postalCode,
            city: city || undefined,
            addressLine1: address1 || undefined,
            addressLine2: address2 || undefined,
            province: province || undefined,
          },
          items: checkoutItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(getUserFacingErrorMessage(data?.error, t('errors.checkoutFailed')));
      }

      if (quoteSeqRef.current !== seq) return;
      setQuote(data.quote);
    } catch (e: any) {
      if (abortController.signal.aborted) return;
      if (quoteSeqRef.current !== seq) return;

      setQuote(null);
      setQuoteError(e?.message || t('errors.checkoutFailed'));
    } finally {
      if (quoteSeqRef.current !== seq) return;
      setIsQuoting(false);
    }
  };

  const debouncedQuote = useDebounce(() => {
    if (!isAddressReadyForShipping) return;
    void handleQuote();
  }, 450);

  useEffect(() => {
    if (isCartEmpty) {
      setQuote(null);
      setQuoteError(null);
      setShippingMethod('');
      return;
    }

    // Reset dependent states when shipping cannot be computed
    if (!isAddressReadyForShipping) {
      setQuote(null);
      setQuoteError(null);
      setShippingMethod('');
      return;
    }

    // Auto-requote when a shippable address changes
    debouncedQuote();
  }, [
    isAddressReadyForShipping,
    isCartEmpty,
    country,
    postalCode,
    city,
    address1,
    address2,
    province,
    subtotal,
  ]);

  useEffect(() => {
    return () => {
      quoteAbortRef.current?.abort();
    };
  }, []);

  const handleCreateIntent = async () => {
    const validation = validateAll();

    if (!validation.valid) {
      // Scroll to first error field
      setTimeout(() => {
        const errorFields = Object.keys(validation.errors);
        const order = [
          'email',
          'country',
          'postalCode',
          'name',
          'surname',
          'company',
          'addressLine1',
          'addressLine2',
          'city',
          'province',
          'phone',
          'shippingMethod',
        ];
        const firstErrorField = errorFields.sort((a, b) => order.indexOf(a) - order.indexOf(b))[0];

        if (firstErrorField) {
          const fieldId = `checkout-${firstErrorField === 'addressLine1' ? 'address1' : firstErrorField === 'addressLine2' ? 'address2' : firstErrorField}`;
          const element = document.getElementById(fieldId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => element.focus(), 300);
          }
        }
      }, 100);
      return;
    }

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
            company: company || undefined,
            addressLine2: address2 || undefined,
            province: province || undefined,
          },
          marketingOptIn,
          shippingMethod,
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

  const shippingPriceForUi = quote?.shippingPrice ?? 5.9;
  const totalForUi =
    quote?.total ?? Math.round((subtotal - (promoDiscount || 0) + shippingPriceForUi) * 100) / 100;

  const clearShippingMethodError = () =>
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.shippingMethod;
      return next;
    });

  return (
    <section className="py-6 md:py-9">
      <SimpleBreadcrumbs
        className="py-0"
        items={[
          { label: tHeaderActions('home'), href: '/' },
          { label: tCart('title'), href: '/cart' },
          { label: t('title') },
        ]}
      />
      <div className="mx-auto md:max-w-[1570px] pt-6 md:pt-10 px-4 md:px-8 lg:px-12">
        <h1 className="font-semibold text-[clamp(30px,5vw,47px)] leading-[clamp(30px,5vw,50px)] text-center mb-8 md:mb-12">
          {t('title')}
        </h1>

        <div className="flex flex-col-reverse gap-4 items-center justify-center lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6 lg:items-start">
          <div className="w-full space-y-6 overflow-x-hidden lg:overflow-x-visible">
            <CheckoutContactSection
              isAuthenticated={isAuthenticated}
              onOpenAuthModal={() => setShowAuthModal(true)}
              email={email}
              setEmail={setEmail}
              marketingOptIn={marketingOptIn}
              setMarketingOptIn={setMarketingOptIn}
              touched={touched}
              fieldErrors={fieldErrors}
              getInputClass={getInputClass}
              touchField={touchField}
              validateField={validateField}
              hasUnparseableItems={checkoutItemsInfo.hasUnparseableItems}
              error={error}
            />

            <CheckoutDeliverySection
              country={country}
              setCountry={setCountry}
              postalCode={postalCode}
              setPostalCode={setPostalCode}
              name={name}
              setName={setName}
              surname={surname}
              setSurname={setSurname}
              company={company}
              setCompany={setCompany}
              address1={address1}
              setAddress1={setAddress1}
              address2={address2}
              setAddress2={setAddress2}
              city={city}
              setCity={setCity}
              province={province}
              setProvince={setProvince}
              phone={phone}
              setPhone={setPhone}
              touched={touched}
              fieldErrors={fieldErrors}
              getInputClass={getInputClass}
              touchField={touchField}
              validateField={validateField}
            />

            <CheckoutShippingMethodSection
              isAddressReady={isAddressReadyForShipping}
              isQuoting={isQuoting}
              quoteError={quoteError}
              onRetryQuote={handleQuote}
              shippingMethod={shippingMethod}
              setShippingMethod={setShippingMethod}
              touchField={touchField}
              clearShippingMethodError={clearShippingMethodError}
              shippingPrice={shippingPriceForUi}
              touched={touched}
              fieldErrors={fieldErrors}
            />

            <CheckoutPaymentSection
              clientSecret={clientSecret}
              orderId={orderId}
              stripePromise={stripePromise}
              canProceed={canProceed}
              isCreating={isCreating}
              onCreateIntent={handleCreateIntent}
              billingDetails={{
                name: `${name}${surname ? ` ${surname}` : ''}`,
                email: email,
                phone: phone || undefined,
                address: {
                  line1: address1 || undefined,
                  line2: address2 || undefined,
                  city: city || undefined,
                  state: province || undefined,
                  postalCode: postalCode || undefined,
                  country: country || 'IT',
                },
              }}
            />
          </div>

          <div className="w-full self-start lg:self-stretch">
            <div className="space-y-6 lg:pb-6 lg:sticky lg:top-48">
              <CheckoutSummaryPanel
                isStripeConfigured={isStripeConfigured}
                subtotal={subtotal}
                promoDiscount={promoDiscount || 0}
                shippingPrice={shippingPriceForUi}
                isQuoting={isQuoting}
                quoteError={quoteError}
                totalForUi={totalForUi}
              />

              <Link
                href="/cart"
                className="group text-sm flex items-center justify-center gap-2 py-4 px-6
                 text-text-extrablack duration-300 transition-all hover:underline
                  bg-brand-accent text-center rounded-[25px] font-semibold
                 "
              >
                <Cart className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110" />
                {t('misc.backToCart')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialType="login"
        redirectTo=""
      />
    </section>
  );
}
