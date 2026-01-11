'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui';
import { useCapsLockDetector } from '@/lib/utils/useCapsLock';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';

interface EditableFieldProps {
  label: string;
  value: string | undefined;
  name: string;
  onSave: (name: string, value: string) => Promise<void>;
  type?: string;
  validate?: (value: string) => string;
  required?: boolean;
}

export default function EditableField({
  label,
  value,
  name,
  onSave,
  type = 'text',
  validate,
  required = false,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = useTranslations('user.account.profile');
  const tCommon = useTranslations('common.form');
  const { capsLockOn } = useCapsLockDetector();

  const handleSave = async () => {
    const val = normalizeInputValue(inputValue.trim(), name);

    if (validate) {
      const validationError = validate(val);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    if (required && !val) {
      setError(t('required', { defaultValue: 'This field is required.' }));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(name, val);
      setEditing(false);
      setInputValue(val);
    } catch {
      setError(t('error', { defaultValue: 'Something went wrong. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(value || '');
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleEditClick = () => {
    setEditing(true);
    setInputValue(value || '');
  };

  return (
    <div className="mb-6">
      <label htmlFor={`field-${name}`} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {editing ? (
        <div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                id={`field-${name}`}
                type={type}
                {...(name === 'email' && { autoComplete: 'email' })}
                {...(name === 'phone' && { autoComplete: 'tel' })}
                {...(name === 'nome' && { autoComplete: 'given-name' })}
                {...(name === 'cognome' && { autoComplete: 'family-name' })}
                {...(name === 'address' && { autoComplete: 'street-address' })}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                autoFocus
                aria-describedby={
                  error ? `error-${name}` : capsLockOn ? `capslock-${name}` : undefined
                }
                aria-label={label}
              />
              {capsLockOn && type !== 'email' && (
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
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('save')}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : (
                <Icon id="check" width={16} height={16} />
              )}
              {!loading && <span className="ml-1">{t('save')}</span>}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              aria-label={t('cancel')}
            >
              <Icon id="x" width={16} height={16} />
              <span className="ml-1">{t('cancel')}</span>
            </button>
          </div>
          {capsLockOn && type !== 'email' && (
            <p id={`capslock-${name}`} className="mt-1 text-sm text-yellow-600">
              {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
            </p>
          )}
          {error && (
            <p id={`error-${name}`} className="mt-1 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div
          className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={handleEditClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEditClick();
            }
          }}
          aria-label={`${t('edit')} ${label}`}
        >
          <span className="text-sm text-gray-900">
            {value || <span className="text-gray-400 italic">-</span>}
          </span>
          <Icon
            id="edit"
            width={16}
            height={16}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
