'use client';

import { useTranslations } from 'next-intl';

export default function ModalBody({ type = 'register', formData, setFormData }) {
  const t = useTranslations('modal.auth');

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {type === 'register' && (
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <input
            type="text"
            value={formData.nome}
            onChange={handleChange('nome')}
            placeholder={t('form.nome')}
            className="w-full lg:w-1/2 rounded-input-xl border border-input py-[18px] px-[26px] text-text-primary placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            required
          />
          <input
            type="text"
            value={formData.cognome}
            onChange={handleChange('cognome')}
            placeholder={t('form.cognome')}
            className="w-full lg:w-1/2 rounded-input-xl border border-input py-[18px] px-[26px] text-text-primary placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
            required
          />
        </div>
      )}

      <input
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        placeholder={t('form.email')}
        className="w-[clamp(280px,90%,620px)] rounded-input-xl border border-input py-[18px] px-[26px] text-text-primary placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        required
      />

      <input
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        placeholder={t('form.password')}
        className="w-[clamp(280px,90%,620px)] rounded-input-xl border border-input py-[18px] px-[26px] text-text-primary placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
        required
      />

      {type === 'register' && (
        <input
          type="password"
          value={formData.confermaPassword}
          onChange={handleChange('confermaPassword')}
          placeholder={t('form.confermaPassword')}
          className="w-[clamp(280px,90%,620px)] rounded-input-xl border border-input py-[18px] px-[26px] text-text-primary placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent"
          required
        />
      )}
    </div>
  );
}
