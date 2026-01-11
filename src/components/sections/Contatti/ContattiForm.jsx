'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';

export default function ContattiForm() {
  const t = useTranslations('contatti');
  const tCommon = useTranslations('common.form');

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    messaggio: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleBlur = (field) => (e) => {
    const normalizedValue = normalizeInputValue(field, e.target.value);
    if (normalizedValue !== e.target.value) {
      setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setFormData({
        nome: '',
        cognome: '',
        email: '',
        telefono: '',
        messaggio: '',
      });
      setSubmitStatus('success');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-background-primary outline-none tabular ' +
    'text-text-primary text-[clamp(16px,2vw,22px)] placeholder:text-text-gray ' +
    'rounded-input-xl lg:rounded-input-xxl py-4 px-8 lg:py-6 lg:px-12 ' +
    'transition-all duration-300 hover:outline-none ' +
    'focus-within:ring-1 focus-within:ring-border-input focus:outline-none';

  return (
    <section className="flex justify-center py-8 lg:py-16 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[400px] md:max-w-[600px] lg:max-w-[1000px] bg-background-grizzly rounded-[100px] lg:rounded-[223px] 
        p-[40px_30px] md:p-[30px_80px] lg:p-[26px_200px] lg:pt-[50px] 
        flex flex-col gap-4 lg:gap-6"
      >
        <h2 className="text-[clamp(22px,3vw,42px)] font-semibold md:mb-2 text-center">
          {t('formTitle')}
        </h2>
        <p className="text-[clamp(18px,2vw,24px)] mb-4 lg:mb-8 text-center">{t('formSubtitle')}</p>

        {/* 📌 Success/Error messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-center">
            {tCommon('submitSuccess', { defaultValue: 'Form submitted successfully!' })}
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-center">
            {tCommon('submitError', { defaultValue: 'Error submitting form. Please try again.' })}
          </div>
        )}

        {/* 📌 First name */}
        <div className="flex flex-col">
          <label className="mb-2 lg:mb-4 font-semibold text-[clamp(16px,2vw,22px)]">
            {t('nome')}
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={handleChange('nome')}
            onBlur={handleBlur('nome')}
            className={inputClass}
            required
          />
        </div>

        {/* 📌 Last name */}
        <div className="flex flex-col">
          <label className="mb-2 lg:mb-4 font-semibold text-[clamp(16px,2vw,22px)]">
            {t('cognome')}
          </label>
          <input
            type="text"
            value={formData.cognome}
            onChange={handleChange('cognome')}
            onBlur={handleBlur('cognome')}
            className={inputClass}
            required
          />
        </div>

        {/* 📌 Email */}
        <div className="flex flex-col">
          <label className="mb-2 lg:mb-4 font-semibold text-[clamp(16px,2vw,22px)]">
            {t('email')}
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            className={inputClass}
            required
          />
        </div>

        {/* 📌 Phone */}
        <div className="flex flex-col">
          <label className="mb-2 lg:mb-4 font-semibold text-[clamp(16px,2vw,22px)]">
            {t('telefono')}
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={handleChange('telefono')}
            className={inputClass}
            required
          />
        </div>

        {/* 📌 Message */}
        <div className="flex flex-col">
          <label className="mb-2 lg:mb-4 font-semibold text-[clamp(16px,2vw,22px)]">
            {t('messaggio')}
          </label>
          <textarea
            value={formData.messaggio}
            onChange={handleChange('messaggio')}
            className={inputClass + ' h-24 lg:h-32 resize-none'}
            required
          />
        </div>

        {/* 📌 Submit */}
        <div className="mx-auto">
          <PrimaryButton
            type="submit"
            disabled={loading}
            className="min-w-[140px] md:w-[200px] lg:w-[280px] px-4 py-4 lg:py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? tCommon('submitting', { defaultValue: 'Submitting...' }) : t('submitButton')}
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
