'use client';

import GreenProductionMobile from './GreenProductionMobile';
import GreenProductionDesktop from './GreenProductionDesktop';
import { useTranslations } from 'next-intl';

export default function GreenProductionSection() {
  const t = useTranslations('greenProductionSection');

  return (
    <section className="py-6 md:py-16 xl:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1100px] px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-12 xl:mb-16">
          {t('headerTitle')} <span className="heading-accent">{t('headerAccent')}</span>?
        </h2>

        <GreenProductionMobile />
        <GreenProductionDesktop />
      </div>
    </section>
  );
}
