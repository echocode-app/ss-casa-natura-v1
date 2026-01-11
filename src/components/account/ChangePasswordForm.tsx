'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChangePasswordData } from '@/types/user';
import { useCapsLockDetector } from '@/lib/utils/useCapsLock';
import { authSchemas } from '@/lib/validation/schemas';
import { validateField as validateSingleField } from '@/lib/validation/helpers';
import FormError from '@/components/ui/Form/FormError';
import notify from '@/lib/notify';

interface ChangePasswordFormProps {
  onLogout?: () => void;
  changePasswordData?: ChangePasswordData;
  setChangePasswordData?: React.Dispatch<React.SetStateAction<ChangePasswordData>>;
  passwordLoading?: boolean;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  userEmail?: string;
}

export default function ChangePasswordForm({
  onLogout,
  changePasswordData,
  setChangePasswordData,
  passwordLoading,
  onSubmit,
  userEmail,
}: ChangePasswordFormProps) {
  const [internalChangePasswordData, setInternalChangePasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [internalLoading, setInternalLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const data = changePasswordData || internalChangePasswordData;
  const setData = setChangePasswordData || setInternalChangePasswordData;
  const loading = passwordLoading !== undefined ? passwordLoading : internalLoading;
  const handleSubmit = onSubmit || handleInternalSubmit;

  const t = useTranslations('user.account.password');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const { capsLockOn } = useCapsLockDetector();

  const validateField = (field: string, value: string) => {
    const error = validateSingleField(authSchemas.changePassword, field, value, tValidation);
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

  async function handleInternalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setInternalLoading(true);

    try {
      authSchemas.changePassword.parse(data);

      const res = await fetch('/api/users/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const responseData = await res.json();

      if (!res.ok) {
        if (responseData?.error === 'Unauthorized') {
          notify.error(t('unauthorized', { defaultValue: 'Non autorizzato. Effettua il login.' }));
        } else {
          notify.error(t('error', { defaultValue: 'Errore. Riprova più tardi.' }));
        }
        return;
      }

      notify.success(responseData.message || t('success'));
      notify.info(t('logoutMessage'));

      setInternalChangePasswordData({ currentPassword: '', newPassword: '' });

      setTimeout(() => {
        if (onLogout) onLogout();
      }, 2000);
    } catch (err) {
      if ((err as any).errors) {
        const errors: Record<string, string> = {};
        (err as any).errors.forEach((error: any) => {
          errors[error.path[0]] = tValidation(error.message);
        });
        setFieldErrors(errors);
        notify.error(tCommon('errors.validationFailed'));
      } else {
        notify.error(tCommon('errors.genericError'));
      }
    } finally {
      setInternalLoading(false);
    }
  }

  const handleInputChange =
    (field: keyof ChangePasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleBlur =
    (field: keyof ChangePasswordData) => (e: React.FocusEvent<HTMLInputElement>) => {
      validateField(field, e.target.value);
    };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 📌 Hidden email field for password manager accessibility */}
        {userEmail && (
          <input
            type="email"
            name="username"
            value={userEmail}
            autoComplete="username"
            readOnly
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}

        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {t('currentPassword')}
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type="password"
              value={data.currentPassword}
              onChange={handleInputChange('currentPassword')}
              onBlur={handleBlur('currentPassword')}
              required
              minLength={8}
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-describedby={
                capsLockOn
                  ? 'currentPassword-capslock currentPassword-help'
                  : 'currentPassword-help'
              }
              aria-label={t('currentPasswordLabel', { defaultValue: 'Current password' })}
              name="currentPassword"
            />
            {capsLockOn && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          {capsLockOn && (
            <p id="currentPassword-capslock" className="mt-1 text-sm text-yellow-600">
              {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
            </p>
          )}
          <FormError message={fieldErrors.currentPassword} />
          <p id="currentPassword-help" className="mt-1 text-sm text-gray-500">
            {t('currentPasswordHelp', { defaultValue: 'Enter your current password' })}
          </p>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {t('newPassword')}
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type="password"
              value={data.newPassword}
              onChange={handleInputChange('newPassword')}
              onBlur={handleBlur('newPassword')}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-describedby={
                capsLockOn ? 'newPassword-capslock newPassword-help' : 'newPassword-help'
              }
              aria-label={t('newPasswordLabel', { defaultValue: 'New password' })}
              name="newPassword"
            />
            {capsLockOn && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          {capsLockOn && (
            <p id="newPassword-capslock" className="mt-1 text-sm text-yellow-600">
              {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
            </p>
          )}
          <FormError message={fieldErrors.newPassword} />
          <p id="newPassword-help" className="mt-1 text-sm text-gray-500">
            {t('newPasswordHelp', {
              defaultValue: 'Choose a strong password with at least 8 characters',
            })}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {t('updating')}
            </>
          ) : (
            t('updatePassword')
          )}
        </button>
      </form>
    </section>
  );
}
