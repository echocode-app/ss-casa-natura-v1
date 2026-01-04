'use client';

import { useTranslations } from 'next-intl';

export default function Mission() {
  const t = useTranslations('missionSection');

  return (
    <div className="mx-auto max-w-[820px]">
      {/* Header with accent span */}
      <h3 className="heading-sm lg:heading-lg xl:heading-xl mb-4 xl:mb-10">
        {t('header.beforeAccent')} <span className="heading-accent">{t('header.accent')}</span>
      </h3>

      {/* Subtitle */}
      <p className="heading-sm lg:heading-lg xl:heading-xl mb-8 xl:mb-12 max-w-none lg:max-w-[500px] mx-auto">
        {t('subtitle')}
      </p>

      {/* Paragraphs */}
      <div className="mb-16">
        <p className="text-text-gray text-[clamp(18px,3vw,24px)] leading-[1.2] text-center">
          {t('paragraph1')}
        </p>
        <p className="text-text-gray text-[clamp(18px,3vw,24px)] leading-[1.2] text-center">
          {t('paragraph2')}
        </p>
        <p className="text-text-gray text-[clamp(18px,3vw,24px)] leading-[1.2] text-center">
          {t('paragraph3')}
        </p>
      </div>
    </div>
  );
}
