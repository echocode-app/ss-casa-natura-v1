import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'textarea';
  placeholder?: string;
  validation?: ValidationRule;
  required?: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormData {
  [key: string]: string;
}

export function useFormValidation<T extends FormData>(initialData: T, fields: FieldConfig[]) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: string, value: string): string | null => {
      const field = fields.find((f) => f.name === name);
      if (!field) return null;

      const rules = field.validation || {};
      if (field.required || rules.required) {
        if (!value.trim()) {
          return `${field.label} is required`;
        }
      }

      if (rules.minLength && value.length < rules.minLength) {
        return `${field.label} must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `${field.label} must be no more than ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return `${field.label} format is invalid`;
      }

      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) return customError;
      }

      // Email validation
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
      }

      // Phone validation
      if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
      }

      return null;
    },
    [fields],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field.name, data[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, fields, validateField]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      setData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      const error = validateField(name, data[name] || '');
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [data, validateField],
  );

  const handleSubmit = useCallback(
    async (
      onSubmit: (data: T) => Promise<void> | void,
      options?: { validateOnSubmit?: boolean },
    ) => {
      const { validateOnSubmit = true } = options || {};

      if (validateOnSubmit && !validateForm()) {
        // Mark all fields as touched to show errors
        const allTouched = fields.reduce(
          (acc, field) => {
            acc[field.name] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        );
        setTouched(allTouched);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, validateForm, fields],
  );

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  const getFieldProps = useCallback(
    (name: string) => ({
      name,
      value: data[name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleChange(name, e.target.value),
      onBlur: () => handleBlur(name),
      error: touched[name] ? errors[name] : '',
      'aria-invalid': !!(touched[name] && errors[name]),
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }),
    [data, errors, touched, handleChange, handleBlur],
  );

  return {
    data,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
  };
}
