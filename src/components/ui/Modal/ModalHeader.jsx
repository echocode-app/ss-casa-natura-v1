'use client';

import { Close } from '@/components/ui/Buttons';
import { useTranslations } from 'next-intl';
import GreenPlanet from '@/components/ui/Parts/GreenPlanet';

export default function ModalHeader({ type = 'register', onClose }) {
  const t = useTranslations('modal.auth');

  return (
    <div className="flex flex-col items-center mb-6 relative">
      <button
        id="close"
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-0 right-0 p-2 text-text-primary hover:text-brand-accent transition-colors"
      >
        <Close className="w-6 h-6" />
      </button>

      <GreenPlanet className="mb-4" />

      {/* Small label */}
      <p className="text-center text-h-default font-light mb-2">{t(`label.${type}`)}</p>

      {/* Big title */}
      {type === 'register' ? (
        <h2 className="text-center text-h-xl font-light leading-[43px]">
          {t('title.register.part1')}{' '}
          <span className="text-[#68B224] font-semibold">{t('title.register.green')}</span>{' '}
          {t('title.register.part2')}
        </h2>
      ) : (
        <h2 className="text-center text-h-xl font-light leading-[43px]">{t('title.login')}</h2>
      )}
    </div>
  );
}
