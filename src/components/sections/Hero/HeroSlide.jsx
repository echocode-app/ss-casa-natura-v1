'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { lineeConfig } from '@/lib/lineeConfig';

export default function HeroSlide({ id, image, title, subtitle, lineKey, cta }) {
  const t = useTranslations('hero');

  // text translations with fallback
  const slideTitle = t?.(`slides.${id}.title`) || title;
  const slideSubtitle = t?.(`slides.${id}.subtitle`) || subtitle;
  const slideCta = t?.(`slides.${id}.cta`) || cta || t('cta');

  // link to product line page
  const line = lineKey ? lineeConfig[lineKey] : null;
  const linkHref = line ? `/linee/${line.slug}` : '#';

  return (
    <div className="relative w-full min-h-[78svh] flex items-center overflow-x-hidden">
      <div className="absolute inset-0" />
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />

      <div className="relative z-10 w-full max-w-[1570px] mx-auto pr-6 pl-10 md:pl-24 lg:pl-26 xl:pl-28">
        <div className="text-primary">
          <h1 className="sr-only">CASA NATURA</h1>

          <h2 className="font-bold text-[clamp(36px,6vw,88px)] max-w-[890px] leading-[0.95]">
            {slideTitle}
          </h2>

          <p className="mt-8 lg:mt-12 text-[clamp(20px,2.5vw,27px)] max-w-[400px] leading-normal">
            {slideSubtitle}
          </p>

          <div className="mt-8 lg:mt-12">
            <Link href={linkHref}>
              <PrimaryButton className="px-8 py-4 lg:py-6 lg:min-w-[300px]">
                {slideCta}
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
