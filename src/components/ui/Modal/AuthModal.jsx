'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import ModalLayout from './ModalLayout';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import { useTranslations } from 'next-intl';

export default function AuthModal({ isOpen, onClose, initialType = 'register' }) {
  const { login } = useAuth();
  const router = useRouter();
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const tErrors = useTranslations('errors');
  const tSuccess = useTranslations('success');
  const tModal = useTranslations('modal.auth');

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });

  const validate = () => {
    const errors = {};
    if (type === 'register') {
      if (!formData.nome.trim())
        errors.nome = tModal('form.nome', { defaultValue: 'First Name is required' });
      if (!formData.cognome.trim())
        errors.cognome = tModal('form.cognome', { defaultValue: 'Last Name is required' });
      if (!formData.email.trim())
        errors.email = tModal('form.email', { defaultValue: 'Email is required' });
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
        errors.email = tErrors('invalidEmail', { defaultValue: 'Invalid email address' });
      if (!formData.password)
        errors.password = tModal('form.password', { defaultValue: 'Password is required' });
      else if (formData.password.length < 8)
        errors.password = tErrors('passwordTooShort', {
          defaultValue: 'Password must be at least 8 characters',
        });
      if (!formData.confermaPassword)
        errors.confermaPassword = tModal('form.confermaPassword', {
          defaultValue: 'Confirm Password is required',
        });
      else if (formData.password !== formData.confermaPassword)
        errors.confermaPassword = tErrors('validationFailed', {
          defaultValue: 'Passwords do not match',
        });
    } else if (type === 'login') {
      if (!formData.email.trim())
        errors.email = tModal('form.email', { defaultValue: 'Email is required' });
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
        errors.email = tErrors('invalidEmail', { defaultValue: 'Invalid email address' });
      if (!formData.password)
        errors.password = tModal('form.password', { defaultValue: 'Password is required' });
    } else if (type === 'forgot') {
      if (!formData.email.trim())
        errors.email = tModal('form.email', { defaultValue: 'Email is required' });
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
        errors.email = tErrors('invalidEmail', { defaultValue: 'Invalid email address' });
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setFieldErrors({});
    setLoading(true);

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setLoading(false);
      return;
    }

    try {
      if (type === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formData.nome,
            cognome: formData.cognome,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.field && data?.message) {
            setFieldErrors({ [data.field]: tErrors(data.message, { defaultValue: data.message }) });
          } else if (data?.errors && Array.isArray(data.errors)) {
            const mapped = {};
            data.errors.forEach((err) => {
              mapped[err.field] = tErrors(err.message, { defaultValue: err.message });
            });
            setFieldErrors(mapped);
          } else {
            setError(
              tErrors(data.error || 'registrationFailed', {
                defaultValue: data.error || 'Registration failed',
              }),
            );
          }
          setLoading(false);
          return;
        }
        setSuccessMsg(
          tSuccess('registrationSuccess', {
            defaultValue: 'Registration successful! Logging in...',
          }),
        );
        const isLoggedIn = await login();
        if (isLoggedIn) {
          onClose?.();
          router.replace('/account');
        } else {
          setError(tErrors('loginFailed', { defaultValue: 'Login failed after registration' }));
          setLoading(false);
        }
      } else if (type === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.field && data?.message) {
            setFieldErrors({ [data.field]: tErrors(data.message, { defaultValue: data.message }) });
          } else if (data?.errors && Array.isArray(data.errors)) {
            const mapped = {};
            data.errors.forEach((err) => {
              mapped[err.field] = tErrors(err.message, { defaultValue: err.message });
            });
            setFieldErrors(mapped);
          } else {
            setError(
              tErrors(data.error || 'loginFailed', { defaultValue: data.error || 'Login failed' }),
            );
          }
          setLoading(false);
          return;
        }
        setSuccessMsg(tSuccess('loginSuccess', { defaultValue: 'Login successful!' }));
        const isLoggedIn = await login();
        if (isLoggedIn) {
          onClose?.();
          router.replace('/account');
        } else {
          setError(tErrors('loginFailed', { defaultValue: 'Login failed' }));
          setLoading(false);
        }
      } else if (type === 'forgot') {
        // Placeholder for forgot password (would call email API)
        setSuccessMsg(
          tSuccess('passwordResetEmailSent', {
            defaultValue: 'If the email exists, you will receive a reset link shortly.',
          }),
        );
        setTimeout(() => {
          handleSwitch('login');
        }, 2000);
      }
    } catch {
      setError(tErrors('genericError', { defaultValue: 'An error occurred. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (newType) => {
    setError('');
    setSuccessMsg('');
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
    setError('');
    setSuccessMsg('');
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

  return (
    <ModalLayout isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[85vh] pb-2 lg:pb-6">
        <ModalHeader type={type} onClose={onClose} />

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4 text-center text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          <ModalBody
            type={type}
            formData={formData}
            setFormData={setFormData}
            fieldErrors={fieldErrors}
          />
          <ModalFooter
            type={type}
            onSubmit={handleSubmit}
            onSwitch={handleSwitch}
            onForgot={handleForgot}
            loading={loading}
          />
        </form>
      </div>
    </ModalLayout>
  );
}
