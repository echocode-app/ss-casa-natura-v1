'use client';

import { useTranslations } from 'next-intl';
import Arrow from '@/components/ui/Buttons/Arrow';

export default function HeroNavigation({ prevRef, nextRef }) {
  const t = useTranslations('hero');

  return (
    <>
      <button
        ref={prevRef}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-[60px] h-[60px] p-[16px] lg:w-[60px] lg:h-[60px] lg:p-[10px] xl:w-[74px] xl:h-[74px] xl:p-[10px] rounded-full bg-brand-accent items-center justify-center transition-all duration-300 hover:shadow-header hover:opacity-90 focus:outline-none focus:shadow-header focus:ring-black"
        aria-label={t('prevSlide')}
      >
        <span className="rotate-180">
          <Arrow />
        </span>
      </button>

      <button
        ref={nextRef}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-[60px] h-[60px] p-[16px] lg:w-[60px] lg:h-[60px] lg:p-[10px] xl:w-[74px] xl:h-[74px] xl:p-[10px] rounded-full bg-brand-accent items-center justify-center transition-all duration-300 hover:shadow-header hover:opacity-90 focus:outline-none focus:shadow-header focus:ring-black"
        aria-label={t('nextSlide')}
      >
        <Arrow />
      </button>
    </>
  );
}
