'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Promocode from '@/components/ui/Form/Promocode';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';

export default function PromocodeForm() {
  const t = useTranslations('promocodeSection.form');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [copied, setCopied] = useState(false);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      notify.error(t('errorEmpty'));
      return;
    }

    if (!isValidEmail(email)) {
      notify.error(t('errorInvalid'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/promocode/claim', {
        method: 'POST',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        const code = data?.errorCode || (res.status === 409 ? 'EMAIL_ALREADY_SUBSCRIBED' : null);

        if (code === 'EMAIL_ALREADY_SUBSCRIBED') {
          // Business rule: promo is only issued for a new subscription.
          // UX: show a friendly message instead of a hard error.
          setPromoCode('');
          setSubmitted(true);
          notify.info(t('errorAlreadySubscribed'));
        } else {
          notify.error(t('errorSend'));
        }
        return;
      }

      setPromoCode(data.promoCode || '');
      setSubmitted(true);
      setEmail('');
      notify.success(t('success'));
    } catch {
      notify.error(t('errorSend'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center m-auto max-w-[70%] lg:max-w-[50%] rounded-[49px] bg-background-green p-3 md:py-4 md:px-6 lg:px-8 text-[clamp(12px,3vw,18px)] font-semibold">
        <p>{promoCode ? t('success') : t('alreadySubscribed')}</p>
        {promoCode && (
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="px-3 py-2 bg-white/70 rounded-button-sm font-extrabold tracking-wider">
              {promoCode}
            </span>
            <button
              type="button"
              className="underline text-sm font-semibold"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(promoCode);
                  setCopied(true);
                  notify.success(t('copied'));
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  notify.error(t('copyError'));
                }
              }}
            >
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto"
    >
      <Promocode
        value={email}
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('placeholder')}
        className="flex-1"
      />

      <PrimaryButton
        type="submit"
        disabled={loading || !email || !isValidEmail(email)}
        className="px-8 py-4 lg:py-6 lg:min-w-[280px]"
      >
        {loading ? <Spinner size="sm" colorScheme="accent" /> : t('submit')}
      </PrimaryButton>
    </form>
  );
}
