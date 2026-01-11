'use client';

import { useTranslations } from 'next-intl';
import GreenPlanet from '@/components/ui/Parts/GreenPlanet';
import { Icon } from '@/components/ui';

export default function ModalHeader({ type = 'register', onClose }) {
  const t = useTranslations('modal.auth');

  return (
    <div className="flex flex-col items-center relative mb-1 lg:mb-4">
      <button
        id="close"
        onClick={onClose}
        aria-label={t('label.close')}
        className="absolute top-0 right-0 md:-top-2 md:-right-2 p-2"
      >
        <Icon
          id="close"
          className="w-5 h-5 md:w-7 md:h-7
          text-text-gray hover:text-text-primary 
          transition-all duration-300 md:hover:scale-105"
        />
      </button>

      <div
        className={`flex flex-col md:flex-row
      justify-between 
      items-center
      gap-2 md:gap-6 xl:gap-10 mb-6
      ${type === 'login' ? 'gap-4 md:gap-14 xl:gap-16' : 'gap-2 md:gap-6 xl:gap-8'}
      `}
      >
        <div
          className="
        hidden md:block
        md:w-[180px] md:h-[180px] 
        lg:w-[220px] lg:h-[220px] 
        overflow-hidden"
        >
          <GreenPlanet />
        </div>
        <div
          className={`
        pt-4
        ${type === 'login' ? 'md:ml-2 md:pt-6' : ''}
        ${type === 'forgot' ? 'md:h-full md:flex md:flex-col md:justify-center' : 'mb-auto'}
  `}
        >
          {/* Small label */}
          <p className="text-center text-lg md:text-h-default font-normal mb-2">
            {t(`label.${type}`)}
          </p>

          {/* Big title */}
          {type === 'register' ? (
            <h2
              className="
            md:max-w-[220px]
            lg:max-w-[340px]
            text-xl
            md:text-h-default lg:text-h-lg xl:text-h-xl
            text-center  
            font-normal"
            >
              {t('title.register.part1')}{' '}
              <span className="text-[#68B224] font-semibold">{t('title.register.green')}</span>{' '}
              {t('title.register.part2')}
            </h2>
          ) : (
            <h2
              className="
            text-h-default lg:text-h-lg xl:text-h-xl
            text-center font-light
            "
            >
              {t('title.login')}
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}
