'use client';

import { useTranslations } from 'next-intl';
import EditableField from './EditableField';
import { User } from '@/types/user';
import { useAuth } from '@/components/layout/AuthContext';

interface ProfileSectionProps {
  user: User;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const t = useTranslations('user.account.profile');
  const { refreshUser } = useAuth();

  const firstName = user.nome || (user as any).name || '';
  const lastName = user.cognome || (user as any).surname || '';
  const deliveryAddress = user.deliveryAddress || '';

  const handleSaveField = async (name: string, value: string) => {
    const body: any = { [name]: value };
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok)
      throw new Error(
        data?.error === 'Unauthorized'
          ? 'Unauthorized. Please log in.'
          : 'Something went wrong. Please try again.',
      );
    // Refresh user data in AuthContext after successful update
    await refreshUser();
  };

  const validateEmail = (value: string) => {
    if (!value) return t('required');
    if (!/\S+@\S+\.\S+/.test(value)) return t('invalidEmail');
    return '';
  };

  const validatePhone = (value: string) => {
    if (value && !/^\+?[0-9\s\-\(\)]{6,20}$/.test(value.replace(/\s/g, ''))) {
      return t('invalidPhone');
    }
    return '';
  };

  return (
    <section className=" p-8">
      <div className="flex flex-col gap-5">
        <EditableField
          label={t('firstName')}
          value={firstName}
          name="nome"
          onSave={handleSaveField}
        />

        <EditableField
          label={t('lastName')}
          value={lastName}
          name="cognome"
          onSave={handleSaveField}
        />

        <EditableField
          label={t('email')}
          value={user.email}
          name="email"
          type="email"
          onSave={handleSaveField}
          validate={validateEmail}
        />

        <EditableField
          label={t('phone')}
          value={user.phone}
          name="phone"
          type="tel"
          onSave={handleSaveField}
          validate={validatePhone}
        />

        <EditableField
          label={t('deliveryAddress')}
          value={deliveryAddress}
          name="deliveryAddress"
          onSave={handleSaveField}
        />
      </div>
    </section>
  );
}
