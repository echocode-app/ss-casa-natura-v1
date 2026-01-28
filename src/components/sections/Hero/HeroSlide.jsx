'use client';

import Link from 'next/link';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function HeroSlide({ image, title, subtitle, cta, href }) {
  const fallbackImage = '/images/home/banner.jpg';
  const fallbackTitle = 'Freschezza Oceanica\nper la tua casa';
  const fallbackSubtitle =
    'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti';
  const fallbackCta = 'Scopri i prodotti';
  const fallbackHref = '/prodotti';

  return (
    <div className="relative w-full min-h-[78svh] flex items-center overflow-x-hidden">
      <div className="absolute inset-0" />
      <img
        src={image || fallbackImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative z-10 w-full max-w-[1570px] mx-auto pr-6 pl-10 md:pl-24 lg:pl-26 xl:pl-28">
        <div className="text-primary">
          <h1 className="sr-only">CASA NATURA</h1>

          <h2 className="font-bold text-[clamp(36px,6vw,88px)] max-w-[890px] leading-[0.95] whitespace-pre-line">
            {title || fallbackTitle}
          </h2>

          <p className="mt-8 lg:mt-12 text-[clamp(20px,2.5vw,27px)] max-w-[400px] leading-normal">
            {subtitle || fallbackSubtitle}
          </p>

          <div className="mt-8 lg:mt-12">
            <Link href={href || fallbackHref}>
              <PrimaryButton className="px-8 py-4 lg:py-6 lg:min-w-[300px]">
                {cta || fallbackCta}
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
