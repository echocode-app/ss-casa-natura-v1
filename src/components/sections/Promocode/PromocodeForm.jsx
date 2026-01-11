'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Promocode from '@/components/ui/Form/Promocode';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';
import notify from '@/lib/notify';

export default function PromocodeForm() {
  const t = useTranslations('promocodeSection.form');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmail('');
      setSubmitted(true);
      notify.success(t('success'));
    } catch {
      notify.error(t('errorSend'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="text-center text-[clamp(16px,2vw,24px)] font-semibold">{t('success')}</p>;
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
