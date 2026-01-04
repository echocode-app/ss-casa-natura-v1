'use client';

import { useTranslations } from 'next-intl';
import PlantBased from '@/components/ui/Parts/PlantBased';
import Quality from '@/components/ui/Parts/Quality';
import Testing from '@/components/ui/Parts/Testing';
import GreenPlanet from '@/components/ui/Parts/GreenPlanet';

export default function GreenProductionMobile() {
  const t = useTranslations('greenProductionSection');

  return (
    <div className="md:hidden flex flex-col gap-3 items-center">
      {/* icons row */}
      <div className="flex gap-2 justify-evenly w-full items-start">
        <div className="flex flex-col items-center gap-2 max-w-[85px] mt-6">
          <span className="rounded-full bg-brand-accent p-3 flex items-center justify-center">
            <PlantBased width={60} height={60} />
          </span>
          <p className="text-center text-[14px]">{t('items.plantBased.text')}</p>
        </div>

        <div className="flex flex-col items-center gap-2 max-w-[85px]">
          <span className="rounded-full bg-brand-accent p-3 flex items-center justify-center">
            <Testing width={60} height={60} />
          </span>
          <p className="text-center text-[14px]">{t('items.testing.text')}</p>
        </div>

        <div className="flex flex-col items-center gap-2 max-w-[85px] mt-6">
          <span className="rounded-full bg-brand-accent p-3 flex items-center justify-center">
            <Quality width={60} height={60} />
          </span>
          <p className="text-center text-[14px]">{t('items.quality.text')}</p>
        </div>
      </div>

      {/* planet */}
      <div className="flex justify-center">
        <GreenPlanet width={240} height={240} aria-label={t('items.planet.alt')} />
      </div>
    </div>
  );
}
