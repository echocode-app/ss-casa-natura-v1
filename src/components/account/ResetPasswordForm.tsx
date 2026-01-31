'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { authSchemas } from '@/lib/validation/schemas';
import { validateField as validateSingleField } from '@/lib/validation/helpers';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import notify from '@/lib/notify';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useTranslations('user.account.password');
  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');

  const [data, setData] = useState({ newPassword: '', confermaPassword: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateField = (field: string, value: string) => {
    const error = validateSingleField(authSchemas.resetPassword, field, value, tValidation);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    try {
      authSchemas.resetPassword.parse(data);

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        if (responseData?.errorCode === 'TOKEN_INVALID') {
          notify.error(t('resetInvalidToken'));
        } else {
          notify.error(tErrors('forgotFailed'));
        }
        return;
      }

      notify.success(t('resetSuccess'));
      setData({ newPassword: '', confermaPassword: '' });
    } catch (err: any) {
      const issues = err?.issues || err?.errors;
      if (issues) {
        const errors: Record<string, string> = {};
        issues.forEach((error: any) => {
          errors[error.path[0]] = tValidation(error.message);
        });
        setFieldErrors(errors);
        notify.error(tErrors('validationFailed'));
      } else {
        notify.error(t('genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-5 lg:p-20">
      <div className="font-semibold flex flex-col gap-3 lg:gap-9 mb-3 lg:mb-6 text-[clamp(20px,3vw,30px)]">
        <h1>{t('resetTitle')}</h1>
        <h2 className="text-base font-normal text-gray-600">{t('resetSubtitle')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="newPassword" className="block text-[16px] md:text-h-default mb-2 lg:mb-1">
            {t('newPassword')}
          </label>
          <input
            id="newPassword"
            type="password"
            value={data.newPassword}
            onChange={(e) => setData((prev) => ({ ...prev, newPassword: e.target.value }))}
            onBlur={(e) => validateField('newPassword', e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full pr-10 md:pr-14 py-3 pl-4 md:pl-10 border rounded-input-xl
              h-[40px] lg:h-[70px]
              text-[clamp(14px,3vw,24px)]
              focus:outline-none font-variant-tabular
              text-text-extrablack bg-white border-input focus:border-gray-600"
            aria-label={t('newPasswordLabel')}
          />
          {fieldErrors.newPassword && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confermaPassword"
            className="block text-[16px] md:text-h-default mb-2 lg:mb-1"
          >
            {t('confirmPassword')}
          </label>
          <input
            id="confermaPassword"
            type="password"
            value={data.confermaPassword}
            onChange={(e) => setData((prev) => ({ ...prev, confermaPassword: e.target.value }))}
            onBlur={(e) => validateField('confermaPassword', e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full pr-10 md:pr-14 py-3 pl-4 md:pl-10 border rounded-input-xl
              h-[40px] lg:h-[70px]
              text-[clamp(14px,3vw,24px)]
              focus:outline-none font-variant-tabular
              text-text-extrablack bg-white border-input focus:border-gray-600"
            aria-label={t('confirmPasswordLabel')}
          />
          {fieldErrors.confermaPassword && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.confermaPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-black text-white font-semibold rounded-full px-6 py-3 transition ${
            loading ? 'opacity-70 cursor-wait' : 'hover:opacity-90'
          }`}
        >
          {loading ? t('updating') : t('resetPassword')}
        </button>
      </form>
    </section>
  );
}
