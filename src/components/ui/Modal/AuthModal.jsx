'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { useTranslations } from 'next-intl';
import { authSchemas } from '@/lib/validation/schemas';
import { validateField as validateSingleField } from '@/lib/validation/helpers';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import notify from '@/lib/notify';
import ModalLayout from './ModalLayout';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';

export default function AuthModal({ isOpen, onClose, initialType = 'register' }) {
  const { login } = useAuth();
  const router = useRouter();
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const tValidation = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const tSuccess = useTranslations('success');

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });

  const validateField = (field, value) => {
    const currentSchema = type === 'register' ? authSchemas.register : authSchemas.login;

    // Special handling for confermaPassword
    if (field === 'confermaPassword') {
      if (value !== formData.password) {
        setFieldErrors((prev) => ({ ...prev, [field]: tValidation('passwordsNotMatch') }));
        return;
      } else {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return;
      }
    }

    const error = validateSingleField(currentSchema, field, value, tValidation);

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

  const validate = () => {
    try {
      if (type === 'register') {
        authSchemas.register.parse(formData);
        if (formData.password !== formData.confermaPassword) {
          return { confermaPassword: tValidation('passwordsNotMatch') };
        }
      } else if (type === 'login') {
        authSchemas.login.parse(formData);
      } else if (type === 'forgot') {
        authSchemas.forgotPassword.parse({ email: formData.email });
      }

      return {};
    } catch (err) {
      const errors = {};
      if (err?.issues) {
        err.issues.forEach((error) => {
          const field = error.path[0];
          const message = tValidation(error.message);
          errors[field] = message;
        });
      }
      return errors;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const clientErrors = validate();

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setLoading(false);
      const firstError = Object.values(clientErrors)[0];
      notify.error(firstError);
      return;
    }

    try {
      if (type === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({
            nome: formData.nome,
            cognome: formData.cognome,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.details) {
            // API validation errors - just show first error without field mapping
            const firstFieldErrors = Object.values(data.details)[0];
            const firstError = Array.isArray(firstFieldErrors)
              ? firstFieldErrors[0]
              : firstFieldErrors;
            notify.error(firstError || tErrors('registrationFailed'));
          } else if (data.error === 'Email already exists') {
            setFieldErrors({ email: tErrors('emailExists') });
            notify.error(tErrors('emailExists'));
          } else {
            notify.error(data.error || tErrors('registrationFailed'));
          }
          return;
        }

        notify.success(tSuccess('registrationSuccess'));
        const isLoggedIn = await login();
        if (isLoggedIn) {
          onClose?.();
          router.replace('/account');
        } else {
          notify.error(tErrors('loginFailed'));
        }
      } else if (type === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            notify.error(tErrors('tooManyAttempts'));
          } else if (data.details) {
            // API validation errors - just show first error
            const firstFieldErrors = Object.values(data.details)[0];
            const firstError = Array.isArray(firstFieldErrors)
              ? firstFieldErrors[0]
              : firstFieldErrors;
            notify.error(firstError || tErrors('invalidCredentials'));
          } else if (data.error === 'Invalid credentials') {
            notify.error(tErrors('invalidCredentials'));
          } else {
            notify.error(data.error || tErrors('invalidCredentials'));
          }
          return;
        }

        notify.success(tSuccess('loginSuccess'));
        const isLoggedIn = await login();
        if (isLoggedIn) {
          onClose?.();
          router.replace('/account');
        } else {
          notify.error(tErrors('genericError'));
        }
      } else if (type === 'forgot') {
        notify.info(tSuccess('passwordResetEmailSent'));
        setTimeout(() => {
          handleSwitch('login');
        }, 2000);
      }
    } catch {
      notify.error(tErrors('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (newType) => {
    setFieldErrors({});
    setType(newType);
    setFormData({
      nome: '',
      cognome: '',
      email: '',
      password: '',
      confermaPassword: '',
    });
  };

  const handleForgot = () => {
    setFieldErrors({});
    setType('forgot');
    setFormData({
      nome: '',
      cognome: '',
      email: '',
      password: '',
      confermaPassword: '',
    });
  };

  const handleInputBlur = (field) => {
    const value = formData[field] || '';
    validateField(field, value);
  };

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <ModalHeader type={type} onClose={onClose} />

      <form onSubmit={handleSubmit}>
        <ModalBody
          type={type}
          formData={formData}
          setFormData={setFormData}
          onInputBlur={handleInputBlur}
          fieldErrors={fieldErrors}
        />

        <ModalFooter
          type={type}
          loading={loading}
          onSwitch={handleSwitch}
          onForgot={handleForgot}
        />
      </form>
    </ModalLayout>
  );
}
