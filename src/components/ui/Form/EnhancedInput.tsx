'use client';

import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { useCapsLockDetector } from '@/lib/utils/useCapsLock';
import { normalizeInputValue } from '@/lib/utils/inputHelpers';
import { useTranslations } from 'next-intl';

export interface EnhancedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCapsLockWarning?: boolean;
  normalizeValue?: boolean;
  onValueChange?: (value: string) => void;
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      label,
      error,
      helperText,
      showCapsLockWarning = true,
      normalizeValue = true,
      onValueChange,
      onChange,
      onBlur,
      className = '',
      type = 'text',
      name = '',
      ...props
    },
    ref,
  ) => {
    const { capsLockOn } = useCapsLockDetector();
    const [localValue, setLocalValue] = useState(props.value || '');
    const t = useTranslations('common.form');

    const shouldShowCapsLock =
      showCapsLockWarning && capsLockOn && (type === 'password' || type === 'text');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setLocalValue(rawValue);

      if (onChange) {
        onChange(e);
      }

      if (onValueChange) {
        onValueChange(rawValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (normalizeValue && name) {
        const normalized = normalizeInputValue(e.target.value, name);
        setLocalValue(normalized);

        // Update the actual input value
        e.target.value = normalized;

        if (onValueChange) {
          onValueChange(normalized);
        }
      }

      if (onBlur) {
        onBlur(e);
      }
    };

    const baseInputClasses = `
      w-full px-3 py-2 
      border rounded-md 
      transition-colors duration-200
      focus:outline-none focus:ring-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        error
          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
      }
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={type}
            name={name}
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${baseInputClasses} ${className}`}
            {...props}
          />

          {shouldShowCapsLock && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {shouldShowCapsLock && (
          <p className="mt-1 text-sm text-yellow-600">
            {t('capsLockWarning', { defaultValue: 'Caps Lock is on' })}
          </p>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  },
);

EnhancedInput.displayName = 'EnhancedInput';

export default EnhancedInput;
