'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';
import { contactSchema } from '@/lib/validation/schemas';
import { validateField as validateSingleField } from '@/lib/validation/helpers';
import FormError from '@/components/ui/Form/FormError';
import notify from '@/lib/notify';

export default function ContattiForm() {
  const t = useTranslations('contatti');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    messaggio: '',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const normalizedValue = normalizeInputValue(value, field);
    setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
  };

  const validateField = (field, value) => {
    const error = validateSingleField(contactSchema, field, value, tValidation);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field) => (e) => {
    const value = e.target.value;
    const normalizedValue = normalizeInputValue(value, field);
    if (normalizedValue !== value) {
      setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
    }
    // 📌 Always validate on blur, even if empty
    validateField(field, normalizedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      contactSchema.parse(formData);

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

      notify.success(tCommon('success.messageSent'));
    } catch (err) {
      if (err.errors) {
        const errors = {};
        err.errors.forEach((error) => {
          errors[error.path[0]] = tValidation(error.message);
        });
        setFieldErrors(errors);
        notify.error(tCommon('errors.validationFailed'));
      } else {
        notify.error(tCommon('errors.genericError'));
      }
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
          <FormError message={fieldErrors.nome} />
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
          <FormError message={fieldErrors.cognome} />
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
            onBlur={handleBlur('email')}
            className={inputClass}
            required
          />
          <FormError message={fieldErrors.email} />
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
            onBlur={handleBlur('telefono')}
            className={inputClass}
            required
          />
          <FormError message={fieldErrors.telefono} />
        </div>

        {/* 📌 Message */}
        <div className="flex flex-col">
          <label className="mb-2 lg:mb-4 font-semibold text-[clamp(16px,2vw,22px)]">
            {t('messaggio')}
          </label>
          <textarea
            value={formData.messaggio}
            onChange={handleChange('messaggio')}
            onBlur={handleBlur('messaggio')}
            className={inputClass + ' h-24 lg:h-32 resize-none'}
            required
          />
          <FormError message={fieldErrors.messaggio} />
        </div>

        {/* 📌 Submit */}
        <div className="mx-auto">
          <PrimaryButton
            type="submit"
            disabled={loading}
            className="min-w-[140px] md:w-[200px] lg:w-[280px] px-4 py-4 lg:py-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('loading') : t('submitButton')}
          </PrimaryButton>
        </div>
      </form>
    </section>
  );
}
