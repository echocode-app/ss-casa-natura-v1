'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChangePasswordData } from '@/types/user';
import { useCapsLockDetector } from '@/lib/utils/useCapsLock';
import { authSchemas } from '@/lib/validation/schemas';
import { validateField as validateSingleField } from '@/lib/validation/helpers';
import notify from '@/lib/notify';
import Edit from '../ui/Buttons/Edit';
import Check from '../ui/Buttons/Check';

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
  const [editingNew, setEditingNew] = useState(false);

  const data = changePasswordData || internalChangePasswordData;
  const setData = setChangePasswordData || setInternalChangePasswordData;
  const loading = passwordLoading !== undefined ? passwordLoading : internalLoading;
  const handleSubmit = onSubmit || handleInternalSubmit;

  const t = useTranslations('user.account.password');
  const p = useTranslations('user.account.profile');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');
  const { capsLockOn } = useCapsLockDetector();

  const hasCurrent = Boolean(data.currentPassword);
  const hasNewChanges = Boolean(data.newPassword);

  const validateField = (field: string, value: string) => {
    const error = validateSingleField(authSchemas.changePassword, field, value, tValidation);
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
      setEditingNew(false);

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
        notify.error(t('genericError'));
      }
    } finally {
      setInternalLoading(false);
    }
  }

  const handleInputChange =
    (field: keyof ChangePasswordData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setData((prev) => {
        const next = { ...prev, [field]: value };

        if (field === 'newPassword' && next.currentPassword && next.currentPassword === value) {
          setFieldErrors((prev) => ({
            ...prev,
            newPassword: t('passwordsMustBeDifferent'),
          }));
        } else if (field === 'newPassword') {
          setFieldErrors((prev) => {
            const copy = { ...prev };
            delete copy.newPassword;
            return copy;
          });
        }

        return next;
      });
    };

  const handleBlur =
    (field: keyof ChangePasswordData) => (e: React.FocusEvent<HTMLInputElement>) => {
      validateField(field, e.target.value);
    };

  return (
    <div className="flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col">
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

        <div className="mb-6">
          <label
            htmlFor="currentPassword"
            className="block text-[16px] md:text-h-default mb-2 lg:mb-1"
          >
            {t('currentPassword')}
          </label>
          <div className="relative flex items-center">
            <input
              id="currentPassword"
              type="password"
              value={data.currentPassword}
              onChange={handleInputChange('currentPassword')}
              onBlur={handleBlur('currentPassword')}
              required
              minLength={8}
              autoComplete="current-password"
              className="w-full pr-10 md:pr-14 py-3 pl-4 md:pl-10 border rounded-input-xl
                h-[40px] lg:h-[70px]
                text-[clamp(14px,3vw,24px)]
                focus:outline-none font-variant-tabular
                text-text-extrablack bg-white border-input focus:border-gray-600"
              aria-describedby={
                capsLockOn
                  ? 'currentPassword-capslock currentPassword-error'
                  : 'currentPassword-error'
              }
              aria-label={t('currentPasswordLabel', { defaultValue: 'Current password' })}
              name="currentPassword"
            />
          </div>
          {capsLockOn && (
            <p id="currentPassword-capslock" className="mt-1 text-sm text-yellow-600">
              {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
            </p>
          )}
          {fieldErrors.currentPassword && (
            <p id="currentPassword-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        {/* New password Edit → Check */}
        <div className="mb-6">
          <label htmlFor="newPassword" className="block text-[16px] md:text-h-default mb-2 lg:mb-1">
            {t('newPassword')}
          </label>
          <div className="relative flex items-center">
            <input
              id="newPassword"
              type="password"
              value={data.newPassword}
              onChange={(e) => {
                setData((prev) => ({ ...prev, newPassword: e.target.value }));
                if (!editingNew) setEditingNew(true);
              }}
              onFocus={() => setEditingNew(true)}
              onBlur={handleBlur('newPassword')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hasCurrent && hasNewChanges) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full pr-10 md:pr-14 py-3 pl-4 md:pl-10 border rounded-input-xl
                h-[40px] lg:h-[70px]
                text-[clamp(14px,3vw,24px)]
                focus:outline-none font-variant-tabular
                text-text-extrablack bg-white border-input focus:border-gray-600"
              aria-describedby={
                capsLockOn ? 'newPassword-capslock newPassword-error' : 'newPassword-error'
              }
              aria-label={t('newPasswordLabel', { defaultValue: 'New password' })}
              name="newPassword"
            />

            {!editingNew && (
              <button
                type="button"
                onClick={() => setEditingNew(true)}
                className="absolute right-3 md:right-5 flex items-center justify-center
                  transition-transform duration-300 md:hover:scale-105 md:focus-visible:scale-105"
                aria-label={p('edit')}
              >
                <Edit />
              </button>
            )}

            {editingNew && hasCurrent && hasNewChanges && (
              <button
                type="submit"
                disabled={loading}
                className="absolute right-3 md:right-5 flex items-center justify-center
                  transition-transform duration-300 md:hover:scale-105 md:focus-visible:scale-105"
                aria-label={t('updatePassword')}
              >
                {loading ? (
                  <span className="inline-block w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check />
                )}
              </button>
            )}
          </div>

          {capsLockOn && (
            <p id="newPassword-capslock" className="mt-1 text-sm text-yellow-600">
              {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
            </p>
          )}
          {fieldErrors.newPassword && (
            <p id="newPassword-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.newPassword}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
