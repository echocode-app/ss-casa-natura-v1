'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { useState } from 'react';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';
import FormError from '@/components/ui/Form/FormError';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';

export type ShippingQuote = {
  shippingPrice: number;
  subtotal: number;
  promoDiscount: number;
  total: number;
};

export type ShippingMethod = 'one_time' | 'recurring_4w' | '';

function CheckoutExpressCheckout({ orderId }: { orderId: string }) {
  const t = useTranslations('checkout');
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);

  const onConfirm = async (event: any) => {
    if (!stripe || !elements) return;

    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?orderId=${encodeURIComponent(orderId)}`,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || t('errors.checkoutFailed'));
      try {
        event?.paymentFailed?.({ reason: 'payment_failed' });
      } catch {
        // ignore
      }
      return;
    }

    try {
      event?.paymentConfirmed?.();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-2">
      <ExpressCheckoutElement onConfirm={onConfirm} />
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  );
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

      <div className="text-xs text-text-muted">{t('payment.shopPhoneDisclaimer')}</div>

      <PrimaryButton
        onClick={() => {}}
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full py-4"
      >
        {isSubmitting ? <Spinner size="sm" colorScheme="light" /> : t('actions.placeOrder')}
      </PrimaryButton>

      <div className="text-xs text-text-muted">
        {t.rich('payment.recurringDisclaimer', {
          privacy: (chunks) => (
            <Link href="/privacy-policy" className="underline hover:no-underline">
              {chunks}
            </Link>
          ),
          terms: (chunks) => (
            <Link href="/cookie-policy" className="underline hover:no-underline">
              {chunks}
            </Link>
          ),
        })}
      </div>
    </form>
  );
}

export function CheckoutExpressSection({
  clientSecret,
  orderId,
  stripePromise,
  canProceed: _canProceed,
  isCreating: _isCreating,
  onCreateIntent: _onCreateIntent,
}: {
  clientSecret: string | null;
  orderId: string | null;
  stripePromise: Promise<Stripe | null> | null;
  canProceed: boolean;
  isCreating: boolean;
  onCreateIntent: () => void;
}) {
  const t = useTranslations('checkout');

  return (
    <section className="bg-background-secondary rounded-[20px] p-4 md:p-6">
      <h2 className="font-semibold text-[clamp(16px,3vw,22px)] mb-4">{t('express.title')}</h2>

      {clientSecret && orderId && stripePromise ? (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: { theme: 'stripe' } }}
        >
          <CheckoutExpressCheckout orderId={orderId} />
        </Elements>
      ) : (
        <div className="min-h-[70px] rounded-input-xl border border-dashed border-input flex items-center justify-center text-sm text-text-muted">
          Express checkout will appear here
        </div>
      )}

      <div className="mt-4 text-xs text-text-muted">{t('express.disclaimer')}</div>
    </section>
  );
}

export function CheckoutContactSection({
  isAuthenticated,
  onOpenAuthModal,
  email,
  setEmail,
  marketingOptIn,
  setMarketingOptIn,
  touched,
  fieldErrors,
  getInputClass,
  touchField,
  validateField,
  hasUnparseableItems,
  error,
}: {
  isAuthenticated: boolean;
  onOpenAuthModal: () => void;
  email: string;
  setEmail: (value: string) => void;
  marketingOptIn: boolean;
  setMarketingOptIn: (value: boolean) => void;
  touched: Record<string, boolean>;
  fieldErrors: Record<string, string>;
  getInputClass: (field: string) => string;
  touchField: (field: string) => void;
  validateField: (field: string, value: unknown) => boolean;
  hasUnparseableItems: boolean;
  error: string | null;
}) {
  const t = useTranslations('checkout');

  return (
    <section className="bg-background-secondary rounded-[20px] p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-semibold text-[clamp(16px,3vw,22px)] mb-4">{t('contact.title')}</h2>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="text-sm text-brand-dark hover:underline"
          >
            {t('contact.loginLink')}
          </button>
        )}
      </div>

      {hasUnparseableItems && (
        <div className="text-sm text-red-600 mb-4" role="alert">
          {t('errors.checkoutFailed')}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="checkout-email" className="text-sm font-medium text-text-muted">
            {t('contact.email')}
          </label>
          <input
            id="checkout-email"
            value={email}
            onChange={(e) => {
              const next = e.target.value;
              setEmail(next);
              if (touched.email) validateField('email', next);
            }}
            onBlur={(e) => {
              touchField('email');
              const normalized = normalizeInputValue(e.target.value, 'email');
              if (normalized !== e.target.value) setEmail(normalized);
              validateField('email', normalized);
            }}
            type="email"
            className={getInputClass('email')}
            autoComplete="email"
          />
          <FormError message={touched.email ? fieldErrors.email : ''} />
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
        />
        <span>{t('marketing.label')}</span>
      </label>
    </section>
  );
}

export function CheckoutDeliverySection({
  country,
  setCountry,
  postalCode,
  setPostalCode,
  name,
  setName,
  surname,
  setSurname,
  company,
  setCompany,
  address1,
  setAddress1,
  address2,
  setAddress2,
  city,
  setCity,
  province,
  setProvince,
  phone,
  setPhone,
  touched,
  fieldErrors,
  getInputClass,
  touchField,
  validateField,
}: {
  country: 'IT';
  setCountry: (value: 'IT') => void;
  postalCode: string;
  setPostalCode: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  surname: string;
  setSurname: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  address1: string;
  setAddress1: (value: string) => void;
  address2: string;
  setAddress2: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  province: string;
  setProvince: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  touched: Record<string, boolean>;
  fieldErrors: Record<string, string>;
  getInputClass: (field: string) => string;
  touchField: (field: string) => void;
  validateField: (field: string, value: unknown) => boolean;
}) {
  const t = useTranslations('checkout');

  return (
    <section className="bg-background-secondary rounded-[20px] p-4 md:p-6">
      <h2 className="font-semibold text-[clamp(16px,3vw,22px)] mb-4">{t('delivery.title')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkout-country" className="text-sm font-medium text-text-muted">
            {t('delivery.country')}
          </label>
          <select
            id="checkout-country"
            value={country}
            onChange={(e) => {
              const next = (e.target.value.toUpperCase() as 'IT') || 'IT';
              setCountry(next);
              touchField('country');
              validateField('country', next);
            }}
            className={getInputClass('country')}
          >
            <option value="IT">Italia</option>
          </select>
          <FormError message={touched.country ? fieldErrors.country : ''} />
        </div>

        <div>
          <label htmlFor="checkout-postalCode" className="text-sm font-medium text-text-muted">
            {t('delivery.postalCode')}
          </label>
          <input
            id="checkout-postalCode"
            value={postalCode}
            onChange={(e) => {
              const next = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
              setPostalCode(next);
              if (touched.postalCode) validateField('postalCode', next);
            }}
            onBlur={(e) => {
              touchField('postalCode');
              validateField('postalCode', e.target.value);
            }}
            inputMode="numeric"
            autoComplete="postal-code"
            className={getInputClass('postalCode')}
          />
          <FormError message={touched.postalCode ? fieldErrors.postalCode : ''} />
        </div>

        <div>
          <label htmlFor="checkout-name" className="text-sm font-medium text-text-muted">
            {t('delivery.name')}
          </label>
          <input
            id="checkout-name"
            value={name}
            onChange={(e) => {
              const next = e.target.value;
              setName(next);
              if (touched.name) validateField('name', next);
            }}
            onBlur={(e) => {
              touchField('name');
              const normalized = normalizeInputValue(e.target.value, 'name');
              if (normalized !== e.target.value) setName(normalized);
              validateField('name', normalized);
            }}
            autoComplete="given-name"
            className={getInputClass('name')}
          />
          <FormError message={touched.name ? fieldErrors.name : ''} />
        </div>

        <div>
          <label htmlFor="checkout-surname" className="text-sm font-medium text-text-muted">
            {t('delivery.surname')}
          </label>
          <input
            id="checkout-surname"
            value={surname}
            onChange={(e) => {
              const next = e.target.value;
              setSurname(next);
              if (touched.surname) validateField('surname', next);
            }}
            onBlur={(e) => {
              touchField('surname');
              const normalized = normalizeInputValue(e.target.value, 'surname');
              if (normalized !== e.target.value) setSurname(normalized);
              validateField('surname', normalized);
            }}
            autoComplete="family-name"
            className={getInputClass('surname')}
          />
          <FormError message={touched.surname ? fieldErrors.surname : ''} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkout-company" className="text-sm font-medium text-text-muted">
            {t('delivery.company')}
          </label>
          <input
            id="checkout-company"
            value={company}
            onChange={(e) => {
              const next = e.target.value;
              setCompany(next);
              if (touched.company) validateField('company', next);
            }}
            onBlur={(e) => {
              touchField('company');
              const normalized = normalizeInputValue(e.target.value, 'company');
              if (normalized !== e.target.value) setCompany(normalized);
              validateField('company', normalized);
            }}
            autoComplete="organization"
            className={getInputClass('company')}
          />
          <FormError message={touched.company ? fieldErrors.company : ''} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkout-address1" className="text-sm font-medium text-text-muted">
            {t('delivery.address1')}
          </label>
          <input
            id="checkout-address1"
            value={address1}
            onChange={(e) => {
              const next = e.target.value;
              setAddress1(next);
              if (touched.addressLine1) validateField('addressLine1', next);
            }}
            onBlur={(e) => {
              touchField('addressLine1');
              const normalized = normalizeInputValue(e.target.value, 'addressLine1');
              if (normalized !== e.target.value) setAddress1(normalized);
              validateField('addressLine1', normalized);
            }}
            autoComplete="street-address"
            placeholder={t('delivery.addressAutocompletePlaceholder')}
            className={getInputClass('addressLine1')}
          />
          <FormError message={touched.addressLine1 ? fieldErrors.addressLine1 : ''} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkout-address2" className="text-sm font-medium text-text-muted">
            {t('delivery.address2')}
          </label>
          <input
            id="checkout-address2"
            value={address2}
            onChange={(e) => {
              const next = e.target.value;
              setAddress2(next);
              if (touched.addressLine2) validateField('addressLine2', next);
            }}
            onBlur={(e) => {
              touchField('addressLine2');
              validateField('addressLine2', e.target.value);
            }}
            autoComplete="address-line2"
            className={getInputClass('addressLine2')}
          />
          <FormError message={touched.addressLine2 ? fieldErrors.addressLine2 : ''} />
        </div>

        <div>
          <label htmlFor="checkout-city" className="text-sm font-medium text-text-muted">
            {t('delivery.city')}
          </label>
          <input
            id="checkout-city"
            value={city}
            onChange={(e) => {
              const next = e.target.value;
              setCity(next);
              if (touched.city) validateField('city', next);
            }}
            onBlur={(e) => {
              touchField('city');
              const normalized = normalizeInputValue(e.target.value, 'city');
              if (normalized !== e.target.value) setCity(normalized);
              validateField('city', normalized);
            }}
            autoComplete="address-level2"
            className={getInputClass('city')}
          />
          <FormError message={touched.city ? fieldErrors.city : ''} />
        </div>

        <div>
          <label htmlFor="checkout-province" className="text-sm font-medium text-text-muted">
            {t('delivery.province')}
          </label>
          <input
            id="checkout-province"
            value={province}
            onChange={(e) => {
              const next = e.target.value;
              setProvince(next);
              if (touched.province) validateField('province', next);
            }}
            onBlur={(e) => {
              touchField('province');
              const normalized = normalizeInputValue(e.target.value, 'province');
              if (normalized !== e.target.value) setProvince(normalized);
              validateField('province', normalized);
            }}
            autoComplete="address-level1"
            className={getInputClass('province')}
          />
          <FormError message={touched.province ? fieldErrors.province : ''} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkout-phone" className="text-sm font-medium text-text-muted">
            {t('delivery.phone')}
          </label>
          <input
            id="checkout-phone"
            value={phone}
            onChange={(e) => {
              const next = e.target.value.replace(/[^\d+\s\-()]/g, '');
              setPhone(next);
              if (touched.phone) validateField('phone', next);
            }}
            onBlur={(e) => {
              touchField('phone');
              validateField('phone', e.target.value);
            }}
            autoComplete="tel"
            inputMode="tel"
            className={getInputClass('phone')}
          />
          <FormError message={touched.phone ? fieldErrors.phone : ''} />
        </div>
      </div>
    </section>
  );
}

export function CheckoutShippingMethodSection({
  isAddressValid,
  isQuoting,
  shippingMethod,
  setShippingMethod,
  touchField,
  clearShippingMethodError,
  shippingPrice,
  touched,
  fieldErrors,
}: {
  isAddressValid: boolean;
  isQuoting: boolean;
  shippingMethod: ShippingMethod;
  setShippingMethod: (value: ShippingMethod) => void;
  touchField: (field: string) => void;
  clearShippingMethodError: () => void;
  shippingPrice: number;
  touched: Record<string, boolean>;
  fieldErrors: Record<string, string>;
}) {
  const t = useTranslations('checkout');

  return (
    <section className="bg-background-secondary rounded-[20px] p-4 md:p-6">
      <h2 className="font-semibold text-[clamp(16px,3vw,22px)] mb-2">{t('shipping.title')}</h2>
      <div className="text-sm text-text-muted mb-4">
        <div className="font-medium text-text-extrablack">{t('shipping.firstShipment')}</div>
        <div>{t('shipping.choose')}</div>
      </div>

      {!isAddressValid ? (
        <div className="text-sm text-text-muted">{t('shipping.disabledUntilAddress')}</div>
      ) : (
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-input-xl border border-input bg-white">
            <input
              type="radio"
              name="shippingMethod"
              value="one_time"
              checked={shippingMethod === 'one_time'}
              onChange={() => {
                setShippingMethod('one_time');
                touchField('shippingMethod');
                clearShippingMethodError();
              }}
              disabled={isQuoting}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between gap-4">
                <span className="font-medium">{t('shipping.optionOneTime')}</span>
                <span className="font-semibold">€ {shippingPrice.toFixed(2)}</span>
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-input-xl border border-input bg-white">
            <input
              type="radio"
              name="shippingMethod"
              value="recurring_4w"
              checked={shippingMethod === 'recurring_4w'}
              onChange={() => {
                setShippingMethod('recurring_4w');
                touchField('shippingMethod');
                clearShippingMethodError();
              }}
              disabled={isQuoting}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex justify-between gap-4">
                <span className="font-medium">{t('shipping.optionRecurring')}</span>
                <span className="font-semibold">€ {shippingPrice.toFixed(2)}</span>
              </div>
              <div className="text-sm text-text-muted">{t('shipping.optionRecurringDesc')}</div>
            </div>
          </label>

          <FormError message={touched.shippingMethod ? fieldErrors.shippingMethod : ''} />
        </div>
      )}
    </section>
  );
}

export function CheckoutPaymentSection({
  clientSecret,
  orderId,
  stripePromise,
  canProceed,
  isCreating,
  onCreateIntent,
}: {
  clientSecret: string | null;
  orderId: string | null;
  stripePromise: Promise<Stripe | null> | null;
  canProceed: boolean;
  isCreating: boolean;
  onCreateIntent: () => void;
}) {
  const t = useTranslations('checkout');

  return (
    <section className="bg-background-secondary rounded-[20px] p-4 md:p-6">
      <h2 className="font-semibold text-[clamp(16px,3vw,24px)] mb-2">{t('payment.title')}</h2>
      <div className="text-sm text-text-muted mb-4">{t('payment.secure')}</div>

      {!clientSecret || !orderId ? (
        <div className="space-y-3">
          <div className="text-sm text-text-muted">{t('payment.methodsPreview')}</div>
          <PrimaryButton
            onClick={onCreateIntent}
            disabled={!canProceed || isCreating}
            className="w-full py-4"
          >
            {isCreating ? (
              <Spinner size="sm" colorScheme="light" />
            ) : (
              t('actions.continueToPayment')
            )}
          </PrimaryButton>
        </div>
      ) : !stripePromise ? (
        <div className="text-sm text-red-600" role="alert">
          {t('errors.stripeNotConfigured')}
        </div>
      ) : (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret, appearance: { theme: 'stripe' } }}
        >
          <CheckoutPaymentForm orderId={orderId} />
        </Elements>
      )}
    </section>
  );
}

export function CheckoutSummaryPanel({
  isStripeConfigured,
  subtotal,
  promoDiscount,
  quote,
  totalForUi,
}: {
  isStripeConfigured: boolean;
  subtotal: number;
  promoDiscount: number;
  quote: ShippingQuote | null;
  totalForUi: number;
}) {
  const t = useTranslations('checkout');

  return (
    <div className="bg-background-secondary rounded-[20px] px-10 py-4 lg:p-6 border border-input">
      <h2 className="font-semibold text-[clamp(16px,3vw,24px)] mb-4 md:mb-6 text-center lg:text-left">
        {t('summary.title')}
      </h2>

      {!isStripeConfigured && (
        <div className="text-sm text-red-600 mb-4" role="alert">
          {t('errors.stripeNotConfigured')}
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div className="flex justify-between gap-2">
          <span>{t('summary.subtotal')}</span>
          <span className="font-semibold">€ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-text-muted gap-2">
          <span>{t('summary.promo')}</span>
          <span>€ {(promoDiscount || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-text-muted gap-2">
          <span>{t('summary.shipping')}</span>
          <span>€ {(quote?.shippingPrice ?? 0).toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-200 gap-2 pt-4 flex justify-between text-lg lg:text-2xl font-semibold">
          <span>{t('summary.total')}</span>
          <span>€ {totalForUi.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 text-xs text-text-muted">{t('misc.securePayment')}</div>
    </div>
  );
}
