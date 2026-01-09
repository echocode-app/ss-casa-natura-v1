'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordFormProps {
  onLogout?: () => void;
  changePasswordData?: ChangePasswordData;
  setChangePasswordData?: React.Dispatch<React.SetStateAction<ChangePasswordData>>;
  passwordLoading?: boolean;
  passwordError?: string;
  passwordSuccess?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChangePasswordForm({
  onLogout,
  changePasswordData,
  setChangePasswordData,
  passwordLoading,
  passwordError,
  passwordSuccess,
  onSubmit,
}: ChangePasswordFormProps) {
  // Internal state for standalone usage
  const [internalChangePasswordData, setInternalChangePasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [internalSuccess, setInternalSuccess] = useState('');

  // Use props if provided, otherwise use internal state
  const data = changePasswordData || internalChangePasswordData;
  const setData = setChangePasswordData || setInternalChangePasswordData;
  const loading = passwordLoading !== undefined ? passwordLoading : internalLoading;
  const error = passwordError !== undefined ? passwordError : internalError;
  const success = passwordSuccess !== undefined ? passwordSuccess : internalSuccess;
  const handleSubmit = onSubmit || handleInternalSubmit;

  const t = useTranslations('user.account.password');

  async function handleInternalSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInternalError('');
    setInternalSuccess('');
    setInternalLoading(true);

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setInternalError(responseData.error || responseData.message || t('error'));
        return;
      }

      setInternalSuccess(responseData.message || t('success'));
      setInternalChangePasswordData({ currentPassword: '', newPassword: '' });

      setTimeout(() => {
        if (onLogout) onLogout();
      }, 2000);
    } catch (err: unknown) {
      setInternalError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setInternalLoading(false);
    }
  }

  const handleInputChange =
    (field: keyof ChangePasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <section
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      aria-labelledby="password-heading"
    >
      <h2 id="password-heading" className="text-xl font-semibold text-gray-900 mb-6">
        {t('title')}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
              <p className="text-sm text-green-700 mt-1">{t('logoutMessage')}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {t('currentPassword')}
          </label>
          <input
            id="currentPassword"
            type="password"
            value={data.currentPassword}
            onChange={handleInputChange('currentPassword')}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-describedby="currentPassword-help"
          />
          <p id="currentPassword-help" className="mt-1 text-sm text-gray-500">
            Enter your current password
          </p>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {t('newPassword')}
          </label>
          <input
            id="newPassword"
            type="password"
            value={data.newPassword}
            onChange={handleInputChange('newPassword')}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-describedby="newPassword-help"
          />
          <p id="newPassword-help" className="mt-1 text-sm text-gray-500">
            Minimum 8 characters
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
