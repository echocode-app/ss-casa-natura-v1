'use client';

import { useTranslations } from 'next-intl';
import PlantBased from '@/components/ui/Parts/PlantBased';
import Quality from '@/components/ui/Parts/Quality';
import Testing from '@/components/ui/Parts/Testing';
import GreenPlanet from '@/components/ui/Parts/GreenPlanet';
import Arrow from '@/components/ui/Parts/Arrow';

export default function GreenProductionDesktop() {
  const t = useTranslations('greenProductionSection');

  return (
    <div className="hidden md:grid grid-cols-[auto_1fr_auto] grid-rows-[min-content_auto_min-content_min-content] gap-2 lg:gap-4 items-center justify-items-center md:[grid-template-rows:auto_minmax(140px,1fr)_minmax(56px,0.4fr)_auto] xl:[grid-template-rows:auto_minmax(160px,1.1fr)_minmax(48px,0.35fr)_auto]">
      {/* top arrow */}
      <div />
      <div className="flex">
        <Arrow className="rotate-0 w-[120px] lg:w-[160px] h-auto mb-4 lg:mb-6" />
      </div>
      <div />

      {/* left */}
      <div className="group flex flex-col items-center gap-4 lg:gap-6 max-w-[300px]">
        <span className="rounded-full bg-brand-accent p-3 lg:p-5 transition-all opacity-80 group-hover:opacity-100">
          <PlantBased width={100} height={100} />
        </span>
        <p className="text-center text-[clamp(16px,2vw,23px)]">{t('items.plantBased.text')}</p>
      </div>

      {/* planet */}
      <div className="flex justify-center items-center w-full row-span-2 max-w-[500px]">
        <GreenPlanet width={500} height={500} aria-label={t('items.planet.alt')} />
      </div>

      {/* right */}
      <div className="group flex flex-col items-center gap-4 lg:gap-6 max-w-[300px]">
        <span className="rounded-full bg-brand-accent p-3 lg:p-5 transition-all opacity-80 group-hover:opacity-100">
          <Quality width={100} height={100} />
        </span>
        <p className="text-center text-[clamp(16px,2vw,23px)]">{t('items.quality.text')}</p>
      </div>

      {/* arrows bottom */}
      <div className="row-start-3 row-end-5 col-start-1 justify-self-end flex">
        <Arrow className="-rotate-[135deg] w-[120px] lg:w-[160px] h-auto" />
      </div>
      <div className="row-start-3 row-end-5 col-start-3 justify-self-start flex">
        <Arrow className="rotate-[135deg] w-[120px] lg:w-[160px] h-auto" />
      </div>

      {/* bottom */}
      <div className="group row-start-4 col-start-2 flex flex-col items-center gap-4 lg:gap-6 mt-4 lg:mt-0 max-w-[300px]">
        <span className="rounded-full bg-brand-accent p-3 lg:p-5 transition-all opacity-80 group-hover:opacity-100">
          <Testing width={100} height={100} />
        </span>
        <p className="text-center text-[clamp(16px,2vw,23px)]">{t('items.testing.text')}</p>
      </div>
    </div>
  );
}
