'use client';
import { useTranslations } from 'next-intl';
import { useCapsLockDetector } from '@/lib/utils/useCapsLock';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';
import FormError from '@/components/ui/Form/FormError';

export default function ModalBody({
  type = 'register',
  formData,
  setFormData,
  fieldErrors = {},
  onInputBlur,
}) {
  const t = useTranslations('modal.auth');
  const tCommon = useTranslations('common.form');
  const { capsLockOn, handleKeyEvent } = useCapsLockDetector();

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    // 📌 Normalize immediately for name fields (capitalize)
    const normalizedValue = normalizeInputValue(value, field);
    setFormData((prev) => ({ ...prev, [field]: normalizedValue }));
  };

  const handleBlur = (field) => (e) => {
    // 📌 Trigger validation on blur
    if (onInputBlur) {
      onInputBlur(field);
    }
  };

  const inputClass =
    'w-full border bg-background-primary outline-none ' +
    'text-text-primary text-[clamp(14px,2vw,18px)] placeholder:text-text-gray ' +
    'rounded-input-sm md:rounded-input-xl px-4 py-3 md:px-7 md:py-4 ' +
    'transition-all duration-300 hover:outline-none ' +
    'focus-within:ring-1 focus:outline-none';

  const getInputClass = (field) => {
    const hasError = fieldErrors[field];
    return `${inputClass} ${hasError ? 'border-red-500 focus-within:ring-red-500' : 'border-input focus-within:ring-border-input'}`;
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {type === 'register' && (
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={formData.nome}
              onChange={handleChange('nome')}
              onBlur={handleBlur('nome')}
              placeholder={t('form.nome', { defaultValue: 'First Name' })}
              autoComplete="given-name"
              className={getInputClass('nome')}
            />
            <FormError message={fieldErrors.nome} />
          </div>
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={formData.cognome}
              onChange={handleChange('cognome')}
              onBlur={handleBlur('cognome')}
              placeholder={t('form.cognome', { defaultValue: 'Last Name' })}
              autoComplete="family-name"
              className={getInputClass('cognome')}
            />
            <FormError message={fieldErrors.cognome} />
          </div>
        </div>
      )}

      {(type === 'login' || type === 'forgot' || type === 'register') && (
        <div className="w-full flex flex-col">
          <input
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            placeholder={t('form.email', { defaultValue: 'Email' })}
            autoComplete="email"
            className={getInputClass('email')}
          />
          <FormError message={fieldErrors.email} />
        </div>
      )}

      {type !== 'forgot' && (
        <>
          <div className="w-full flex flex-col relative">
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={handleChange('password')}
                onBlur={handleBlur('password')}
                onKeyDown={handleKeyEvent}
                onKeyUp={handleKeyEvent}
                placeholder={t('form.password', { defaultValue: 'Password' })}
                autoComplete="new-password"
                className={getInputClass('password')}
              />
              {capsLockOn && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 pointer-events-none">
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
              <p className="text-xs text-yellow-600 mt-1">
                {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
              </p>
            )}
            <FormError message={fieldErrors.password} />
          </div>

          {type === 'register' && (
            <div className="w-full flex flex-col relative">
              <div className="relative">
                <input
                  type="password"
                  value={formData.confermaPassword}
                  onChange={handleChange('confermaPassword')}
                  onBlur={handleBlur('confermaPassword')}
                  onKeyDown={handleKeyEvent}
                  onKeyUp={handleKeyEvent}
                  placeholder={t('form.confermaPassword', { defaultValue: 'Confirm Password' })}
                  autoComplete="new-password"
                  className={getInputClass('confermaPassword')}
                />
                {capsLockOn && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 pointer-events-none">
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
                <p className="text-xs text-yellow-600 mt-1">
                  {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
                </p>
              )}
              <FormError message={fieldErrors.confermaPassword} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
