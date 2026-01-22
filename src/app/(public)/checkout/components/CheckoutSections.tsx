'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { useEffect, useMemo, useRef, useState } from 'react';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';
import FormError from '@/components/ui/Form/FormError';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';
import { useDebounce } from '@/hooks/useDebounce';
import { IT_PROVINCES } from '@/lib/address/itProvinces';

type MapboxProxyOk = { features: MapboxFeature[] };
type MapboxProxyErr = { error: { code: string; message: string } };

type MapboxFeature = {
  id: string;
  place_name: string;
  text: string;
  address?: string;
  center?: [number, number];
  context?: Array<{ id: string; text: string; short_code?: string } | undefined>;
  properties?: { postcode?: string };
};

function pickMapboxContextText(feature: MapboxFeature, prefix: string): string | null {
  const ctx = feature.context || [];
  const found = ctx.find((c) => c?.id?.startsWith(prefix));
  return found?.text || null;
}

function getMapboxPostcode(feature: MapboxFeature): string | null {
  const direct = feature.properties?.postcode;
  if (direct) return direct;
  return pickMapboxContextText(feature, 'postcode.');
}

async function fetchMapbox(
  query: string,
  {
    types,
    country,
    language,
    limit,
    proximity,
  }: {
    types: string;
    country?: string;
    language?: string;
    limit?: number;
    proximity?: [number, number];
  },
): Promise<{ features: MapboxFeature[]; error: MapboxProxyErr['error'] | null }> {
  const trimmed = query.trim();
  if (!trimmed) return { features: [], error: null };

  const url = new URL('/api/mapbox/geocode', window.location.origin);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('types', types);
  url.searchParams.set('limit', String(limit ?? 6));
  if (language) url.searchParams.set('language', language);
  if (country && /^[A-Z]{2}$/.test(country.toUpperCase())) {
    url.searchParams.set('country', country.toUpperCase());
  }
  if (proximity) {
    url.searchParams.set('proximity', `${proximity[0]},${proximity[1]}`);
  }

  const res = await fetch(url.toString());
  const data = (await res.json()) as MapboxProxyOk | MapboxProxyErr;
  if (!res.ok || 'error' in data) {
    return {
      features: [],
      error: 'error' in data ? data.error : { code: 'UNKNOWN', message: 'Unknown error' },
    };
  }
  return { features: (data.features || []).filter(Boolean), error: null };
}

async function fetchMapboxReverse(
  center: [number, number],
  {
    types,
    country,
    language,
    limit,
  }: {
    types: string;
    country?: string;
    language?: string;
    limit?: number;
  },
): Promise<{ features: MapboxFeature[]; error: MapboxProxyErr['error'] | null }> {
  const url = new URL('/api/mapbox/geocode', window.location.origin);
  url.searchParams.set('reverse', '1');
  url.searchParams.set('center', `${center[0]},${center[1]}`);
  url.searchParams.set('types', types);
  url.searchParams.set('limit', String(limit ?? 1));
  if (language) url.searchParams.set('language', language);
  if (country && /^[A-Z]{2}$/.test(country.toUpperCase())) {
    url.searchParams.set('country', country.toUpperCase());
  }

  const res = await fetch(url.toString());
  const data = (await res.json()) as MapboxProxyOk | MapboxProxyErr;
  if (!res.ok || 'error' in data) {
    return {
      features: [],
      error: 'error' in data ? data.error : { code: 'UNKNOWN', message: 'Unknown error' },
    };
  }
  return { features: (data.features || []).filter(Boolean), error: null };
}

function buildStreetLine(feature: MapboxFeature): string {
  const parts = [feature.text, feature.address].filter(Boolean);
  return parts.join(' ').trim();
}

function SuggestionsDropdown({
  open,
  isLoading,
  emptyText,
  items,
  activeIndex,
  onPick,
  ariaLabel,
}: {
  open: boolean;
  isLoading: boolean;
  emptyText: string;
  items: Array<{ key: string; label: string }>;
  activeIndex: number;
  onPick: (index: number) => void;
  ariaLabel?: string;
}) {
  if (!open) return null;

  return (
    <div className="absolute z-50 mt-2 w-full rounded-input-xl border border-input bg-white shadow-lg overflow-hidden">
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-text-muted flex items-center gap-2">
          <Spinner size="sm" />
          <span>Caricamento…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="px-4 py-3 text-sm text-text-muted">{emptyText}</div>
      ) : (
        <ul
          role="listbox"
          aria-label={ariaLabel || 'Suggestions'}
          className="max-h-64 overflow-auto"
        >
          {items.map((it, idx) => {
            const isActive = idx === activeIndex;
            return (
              <li
                key={it.key}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  // prevent input blur before click
                  e.preventDefault();
                  onPick(idx);
                }}
                className={
                  'px-4 py-3 text-sm cursor-pointer ' +
                  (isActive
                    ? 'bg-background-secondary text-text-extrablack'
                    : 'text-text-extrablack')
                }
              >
                {it.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

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
            <a href="/privacy-policy" className="underline hover:no-underline">
              {chunks}
            </a>
          ),
          terms: (chunks) => (
            <a href="/cookie-policy" className="underline hover:no-underline">
              {chunks}
            </a>
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
  country: string;
  setCountry: (value: string) => void;
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
  const locale = useLocale();

  const FIXED_COUNTRY = 'IT';

  const countryDisplayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: 'region' });
    } catch {
      return null;
    }
  }, [locale]);

  useEffect(() => {
    if ((country || '').toUpperCase() !== FIXED_COUNTRY) {
      setCountry(FIXED_COUNTRY);
    }
  }, [country, setCountry]);

  const countryLabel = useMemo(() => {
    return countryDisplayNames?.of?.(FIXED_COUNTRY) || 'Italia';
  }, [countryDisplayNames]);

  const provinceOptions = useMemo(() => {
    return IT_PROVINCES.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` }));
  }, []);

  useEffect(() => {
    if (province && !IT_PROVINCES.some((p) => p.code === province)) {
      setProvince('');
    }
  }, [province, setProvince]);

  const [addrOpen, setAddrOpen] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrActiveIndex, setAddrActiveIndex] = useState(-1);
  const [addrFeatures, setAddrFeatures] = useState<MapboxFeature[]>([]);
  const [addrError, setAddrError] = useState<string | null>(null);

  const [cityOpen, setCityOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityActiveIndex, setCityActiveIndex] = useState(-1);
  const [cityFeatures, setCityFeatures] = useState<MapboxFeature[]>([]);
  const [cityError, setCityError] = useState<string | null>(null);

  const lastCityCenterRef = useRef<[number, number] | null>(null);

  const debouncedAddressSearch = useDebounce(async (q: string, _cc: string) => {
    setAddrLoading(true);
    try {
      const { features, error } = await fetchMapbox(q, {
        types: 'address',
        country: FIXED_COUNTRY,
        language: locale,
        limit: 6,
      });
      setAddrError(error ? error.message : null);
      setAddrFeatures(features);
      setAddrActiveIndex(features.length ? 0 : -1);
    } finally {
      setAddrLoading(false);
    }
  }, 250);

  const debouncedCitySearch = useDebounce(async (q: string, _cc: string) => {
    setCityLoading(true);
    try {
      const { features, error } = await fetchMapbox(q, {
        types: 'place',
        country: FIXED_COUNTRY,
        language: locale,
        limit: 6,
      });
      setCityError(error ? error.message : null);
      setCityFeatures(features);
      setCityActiveIndex(features.length ? 0 : -1);
    } finally {
      setCityLoading(false);
    }
  }, 250);

  const addressItems = useMemo(
    () => addrFeatures.map((f) => ({ key: f.id, label: f.place_name })),
    [addrFeatures],
  );

  const cityItems = useMemo(
    () => cityFeatures.map((f) => ({ key: f.id, label: f.text || f.place_name })),
    [cityFeatures],
  );

  async function tryFillPostalCodeFromCityCenter(center: [number, number] | null) {
    if (!center) return;
    if (postalCode.trim()) return;
    const { features } = await fetchMapboxReverse(center, {
      types: 'postcode',
      country: FIXED_COUNTRY,
      language: locale,
      limit: 1,
    });
    const first = features[0];
    const pc = first ? getMapboxPostcode(first) : null;
    if (pc) setPostalCode(String(pc).replace(/\s/g, '').slice(0, 20));
  }

  function applySelectedAddress(feature: MapboxFeature) {
    const nextAddress1 = buildStreetLine(feature);
    const nextCity = pickMapboxContextText(feature, 'place.') || city;
    const nextProvince = pickMapboxContextText(feature, 'region.') || province;
    const nextPostal = getMapboxPostcode(feature) || postalCode;

    setCountry(FIXED_COUNTRY);
    setAddress1(nextAddress1);
    if (nextCity) setCity(nextCity);
    if (nextProvince) setProvince(nextProvince);
    if (nextPostal) setPostalCode(String(nextPostal).replace(/\s/g, '').slice(0, 20));

    // If postcode is missing but we have coordinates, try reverse-lookup a nearby CAP.
    if (!getMapboxPostcode(feature) && feature.center && !postalCode.trim()) {
      void (async () => {
        const { features } = await fetchMapboxReverse(feature.center as [number, number], {
          types: 'postcode',
          country: FIXED_COUNTRY,
          language: locale,
          limit: 1,
        });
        const first = features[0];
        const pc = first ? getMapboxPostcode(first) : null;
        if (pc) setPostalCode(String(pc).replace(/\s/g, '').slice(0, 20));
      })();
    }

    // Re-validate touched fields immediately.
    if (touched.country) validateField('country', FIXED_COUNTRY);
    if (touched.addressLine1) validateField('addressLine1', nextAddress1);
    if (touched.city) validateField('city', nextCity);
    if (touched.province) validateField('province', nextProvince);
    if (touched.postalCode) validateField('postalCode', nextPostal);

    setAddrOpen(false);
  }

  function applySelectedCity(feature: MapboxFeature) {
    const nextCity = feature.text || feature.place_name;
    setCity(nextCity);
    lastCityCenterRef.current = feature.center || null;
    if (touched.city) validateField('city', nextCity);
    setCityOpen(false);
    void tryFillPostalCodeFromCityCenter(lastCityCenterRef.current);
  }

  return (
    <section className="bg-background-secondary rounded-[20px] p-4 md:p-6">
      <h2 className="font-semibold text-[clamp(16px,3vw,22px)] mb-4">{t('delivery.title')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkout-country" className="text-sm font-medium text-text-muted">
            {t('delivery.country')}
          </label>
          <input
            id="checkout-country"
            value={countryLabel}
            readOnly
            className={getInputClass('country')}
          />
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

        <div className="sm:col-span-2 relative">
          <label htmlFor="checkout-address1" className="text-sm font-medium text-text-muted">
            {t('delivery.address1')}
          </label>
          <input
            id="checkout-address1"
            value={address1}
            onChange={(e) => {
              const next = e.target.value;
              setAddress1(next);
              setAddrOpen(true);
              if (next.trim().length >= 3) {
                debouncedAddressSearch(next, 'IT');
              } else {
                setAddrFeatures([]);
                setAddrActiveIndex(-1);
                setAddrError(null);
              }
              if (touched.addressLine1) validateField('addressLine1', next);
            }}
            onFocus={() => {
              if (address1.trim().length >= 3) setAddrOpen(true);
            }}
            onBlur={(e) => {
              touchField('addressLine1');
              const normalized = normalizeInputValue(e.target.value, 'addressLine1');
              if (normalized !== e.target.value) setAddress1(normalized);
              validateField('addressLine1', normalized);
              // close after focus moves (mouse picks are handled via onMouseDown)
              setTimeout(() => setAddrOpen(false), 0);
            }}
            onKeyDown={(e) => {
              if (!addrOpen) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setAddrActiveIndex((i) => Math.min(addressItems.length - 1, Math.max(0, i + 1)));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setAddrActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                if (addrActiveIndex >= 0 && addrActiveIndex < addrFeatures.length) {
                  e.preventDefault();
                  applySelectedAddress(addrFeatures[addrActiveIndex]);
                }
              } else if (e.key === 'Escape') {
                setAddrOpen(false);
              }
            }}
            autoComplete="street-address"
            placeholder={t('delivery.addressAutocompletePlaceholder')}
            className={getInputClass('addressLine1')}
          />
          <SuggestionsDropdown
            open={addrOpen && address1.trim().length >= 3}
            isLoading={addrLoading}
            emptyText={
              addrError
                ? `Autocomplete non disponibile: ${addrError}`
                : 'Nessun risultato. Continua a digitare oppure inserisci manualmente.'
            }
            items={addressItems}
            activeIndex={addrActiveIndex}
            onPick={(idx) => applySelectedAddress(addrFeatures[idx])}
            ariaLabel="Address suggestions"
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

        <div className="relative">
          <label htmlFor="checkout-city" className="text-sm font-medium text-text-muted">
            {t('delivery.city')}
          </label>
          <input
            id="checkout-city"
            value={city}
            onChange={(e) => {
              const next = e.target.value;
              setCity(next);
              setCityOpen(true);
              if (next.trim().length >= 2) {
                debouncedCitySearch(next, 'IT');
              } else {
                setCityFeatures([]);
                setCityActiveIndex(-1);
                setCityError(null);
              }
              if (touched.city) validateField('city', next);
            }}
            onFocus={() => {
              if (city.trim().length >= 2) setCityOpen(true);
            }}
            onBlur={(e) => {
              touchField('city');
              const normalized = normalizeInputValue(e.target.value, 'city');
              if (normalized !== e.target.value) setCity(normalized);
              validateField('city', normalized);
              setTimeout(() => setCityOpen(false), 0);
            }}
            onKeyDown={(e) => {
              if (!cityOpen) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setCityActiveIndex((i) => Math.min(cityItems.length - 1, Math.max(0, i + 1)));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setCityActiveIndex((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                if (cityActiveIndex >= 0 && cityActiveIndex < cityFeatures.length) {
                  e.preventDefault();
                  applySelectedCity(cityFeatures[cityActiveIndex]);
                }
              } else if (e.key === 'Escape') {
                setCityOpen(false);
              }
            }}
            autoComplete="address-level2"
            className={getInputClass('city')}
          />
          <SuggestionsDropdown
            open={cityOpen && city.trim().length >= 2}
            isLoading={cityLoading}
            emptyText={
              cityError
                ? `Autocomplete non disponibile: ${cityError}`
                : 'Nessun risultato. Inserisci manualmente.'
            }
            items={cityItems}
            activeIndex={cityActiveIndex}
            onPick={(idx) => applySelectedCity(cityFeatures[idx])}
            ariaLabel="City suggestions"
          />
          <FormError message={touched.city ? fieldErrors.city : ''} />
        </div>

        <div>
          <label htmlFor="checkout-province" className="text-sm font-medium text-text-muted">
            {t('delivery.province')}
          </label>
          <select
            id="checkout-province"
            value={province}
            onChange={(e) => {
              const next = e.target.value;
              setProvince(next);
              touchField('province');
              validateField('province', next);
            }}
            className={getInputClass('province')}
          >
            <option value="">—</option>
            {provinceOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
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
