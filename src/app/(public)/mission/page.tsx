'use client';

import React from 'react';
import BannerSection from '@/components/sections/BannerSection/BannerSection';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function MissionPage() {
  const t = useTranslations('mission');

  return (
    <main>
      <BannerSection
        title={t('banner.title')}
        subtitle={t('banner.subtitle')}
        backgroundSrc="/images/pages/mission-baner.jpg"
      />

      <section className="relative overflow-x-hidden py-8 md:py-16 lg:py-24">
        <div className="relative z-10 mx-auto max-w-[1570px] px-4 md:px-10 xl:px-12 flex flex-col gap-12 lg:gap-y-24">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-x-10">
            <div className="lg:w-1/2 flex justify-center">
              <Image
                src="/images/pages/mission-img.jpg"
                alt={t('banner.title')}
                width={846}
                height={1196}
                className="object-contain w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <p className="text-[clamp(18px,2vw,24px)] leading-[30px]">
                {t('sections.paragraph1')}
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-x-10">
            <div className="lg:w-1/2 lg:order-2 flex justify-center">
              <Image
                src="/images/pages/mission-img.jpg"
                alt={t('banner.title')}
                width={846}
                height={1196}
                className="object-contain w-full"
              />
            </div>
            <div className="lg:w-1/2 lg:order-1">
              <p className="text-[clamp(18px,2vw,24px)] leading-[30px]">
                {t('sections.paragraph2')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
