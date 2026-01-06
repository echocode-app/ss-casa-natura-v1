'use client';
import { useTranslations } from 'next-intl';

export default function ModalBody({ type = 'register', formData, setFormData }) {
  const t = useTranslations('modal.auth');

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const inputClass =
    'w-full border border-input bg-background-primary outline-none ' +
    'text-text-primary text-[clamp(14px,2vw,18px)] placeholder:text-text-gray ' +
    'rounded-input-sm md:rounded-input-xl px-4 py-3 md:px-7 md:py-4 ' +
    'transition-all duration-300 hover:outline-none ' +
    'focus-within:ring-1 focus-within:ring-border-input focus:outline-none';

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {type === 'register' && (
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <input
            type="text"
            value={formData.nome}
            onChange={handleChange('nome')}
            placeholder={t('form.nome')}
            autoComplete="given-name"
            className={inputClass}
            required
          />
          <input
            type="text"
            value={formData.cognome}
            onChange={handleChange('cognome')}
            placeholder={t('form.cognome')}
            autoComplete="family-name"
            className={inputClass}
            required
          />
        </div>
      )}

      {(type === 'login' || type === 'forgot') && (
        <input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder={t('form.email')}
          autoComplete="email"
          className={inputClass}
          required
        />
      )}

      {type !== 'forgot' && (
        <>
          <input
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            placeholder={t('form.password')}
            autoComplete="new-password"
            className={inputClass}
            required
          />

          {type === 'register' && (
            <input
              type="password"
              value={formData.confermaPassword}
              onChange={handleChange('confermaPassword')}
              placeholder={t('form.confermaPassword')}
              autoComplete="new-password"
              className={inputClass}
              required
            />
          )}
        </>
      )}
    </div>
  );
}
