'use client';

import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import ModalLayout from './ModalLayout';
import ModalHeader from './ModalHeader';
import ModalBody from './ModalBody';
import ModalFooter from './ModalFooter';
import { useTranslations } from 'next-intl';

export default function AuthModal({ isOpen, onClose, initialType = 'register' }) {
  const { login } = useAuth();
  const [type, setType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = useTranslations('errors');
  const tSuccess = useTranslations('success');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

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
          setError(data.error || t('registrationFailed'));
          return;
        }

        setSuccessMsg(tSuccess('registrationSuccess'));
        login();
        setTimeout(() => {
          onClose?.();
        }, 1000);
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
          setError(data.error || t('loginFailed'));
          return;
        }

        setSuccessMsg(tSuccess('loginSuccess'));
        login();
        setTimeout(() => {
          onClose?.();
        }, 1000);
      } else if (type === 'forgot') {
        // Placeholder for forgot password (would call email API)
        setSuccessMsg(tSuccess('passwordResetEmailSent'));
        setTimeout(() => {
          handleSwitch('login');
        }, 2000);
      }
    } catch (err) {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = (newType) => {
    setError('');
    setSuccessMsg('');
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
          <ModalBody type={type} formData={formData} setFormData={setFormData} />
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
