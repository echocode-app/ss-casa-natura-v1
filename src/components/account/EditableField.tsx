'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCapsLockDetector } from '@/lib/utils/useCapsLock';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';
import Edit from '../ui/Buttons/Edit';
import Check from '../ui/Buttons/Check';

interface EditableFieldProps {
  label: string;
  value: string | undefined;
  name: string;
  onSave: (name: string, value: string) => Promise<void>;
  type?: string;
  validate?: (value: string) => string;
  required?: boolean;
  disabled?: boolean;
}

export default function EditableField({
  label,
  value,
  name,
  onSave,
  type = 'text',
  validate,
  required = false,
  disabled = false,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = useTranslations('user.account.profile');
  const tCommon = useTranslations('common.form');
  const { capsLockOn } = useCapsLockDetector();

  useEffect(() => {
    setHasChanges(inputValue !== (value || ''));
  }, [inputValue, value]);

  const handleSave = async () => {
    const val = normalizeInputValue(inputValue.trim(), name);

    if (!hasChanges) return;

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
      setHasChanges(false);
      setInputValue(val);
    } catch {
      setError(t('error', { defaultValue: 'Something went wrong. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && hasChanges) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setInputValue(value || '');
      setError('');
    }
  };

  const activateEditing = () => {
    if (!editing && !disabled) {
      setEditing(true);
      setInputValue(value || '');
      setError('');
    }
  };

  return (
    <div className="mb-6">
      <label htmlFor={`field-${name}`} className="block text-[16px] md:text-h-default mb-2 lg:mb-1">
        {label}
      </label>

      <div className="relative flex items-center">
        <input
          id={`field-${name}`}
          type={type}
          {...(name === 'email' && { autoComplete: 'email' })}
          {...(name === 'phone' && { autoComplete: 'tel' })}
          {...(name === 'nome' && { autoComplete: 'given-name' })}
          {...(name === 'cognome' && { autoComplete: 'family-name' })}
          {...(name === 'deliveryAddress' && { autoComplete: 'street-address' })}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onClick={disabled ? undefined : activateEditing}
          onKeyDown={handleKeyDown}
          readOnly={!editing || disabled}
          autoFocus={editing}
          aria-label={label}
          aria-describedby={error ? `error-${name}` : capsLockOn ? `capslock-${name}` : undefined}
          className={`w-full pr-10 md:pr-14 py-3 pl-4 md:pl-10 border rounded-input-xl
            h-[50px] md:h-[70px]
            text-[clamp(14px,3vw,24px)]
            focus:outline-none font-variant-tabular
            ${disabled ? 'text-text-soft bg-gray-50 border-input cursor-not-allowed' : editing ? 'text-text-extrablack bg-white border-gray-600' : 'text-text-soft bg-transparent border-input cursor-text'}`}
        />

        {editing && hasChanges && !disabled && (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="absolute right-3 md:right-5 flex items-center justify-center
              transition-transform duration-300 md:hover:scale-105 md:focus-visible:scale-105"
            aria-label={t('save')}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 mr-2 justify-center items-center border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check />
            )}
          </button>
        )}

        {!editing && !disabled && (
          <button
            type="button"
            onClick={activateEditing}
            className="absolute right-3 md:right-5 flex items-center justify-center
              transition-transform duration-300 md:hover:scale-105 md:focus-visible:scale-105"
            aria-label={t('edit')}
          >
            <Edit />
          </button>
        )}
      </div>

      {error && (
        <p id={`error-${name}`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {capsLockOn && type !== 'email' && (
        <p id={`capslock-${name}`} className="mt-1 text-sm text-yellow-600">
          {tCommon('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
        </p>
      )}
    </div>
  );
}
