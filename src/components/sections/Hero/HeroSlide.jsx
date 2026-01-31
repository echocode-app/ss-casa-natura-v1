'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function HeroSlide({
  image,
  title,
  subtitle,
  cta,
  href,
  hideContent = false,
  useFallback = true,
}) {
  const fallbackImage = '/images/home/banner.jpg';
  const fallbackTitle = 'Freschezza Oceanica\nper la tua casa';
  const fallbackSubtitle =
    'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti';
  const fallbackCta = 'Scopri i prodotti';
  const fallbackHref = '/prodotti';

  const resolvedImage = image || (useFallback ? fallbackImage : null);
  const resolvedTitle = title || (useFallback ? fallbackTitle : '');
  const resolvedSubtitle = subtitle || (useFallback ? fallbackSubtitle : '');
  const resolvedCta = cta || (useFallback ? fallbackCta : '');
  const resolvedHref = href || (useFallback ? fallbackHref : '#');

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [resolvedImage]);

  return (
    <div className="relative w-full min-h-[78svh] flex items-center overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      {resolvedImage && (
        <img
          src={resolvedImage}
          alt=""
          loading="eager"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <div className="relative z-10 w-full max-w-[1570px] mx-auto pr-6 pl-10 md:pl-24 lg:pl-26 xl:pl-28">
        <div
          className={`text-primary transition-opacity duration-500 ${hideContent ? 'opacity-0' : 'opacity-100'}`}
        >
          <h1 className="sr-only">CASA NATURA</h1>

          <h2 className="font-bold text-[clamp(36px,6vw,88px)] max-w-[890px] leading-[0.95] whitespace-pre-line">
            {resolvedTitle}
          </h2>

          <p className="mt-8 lg:mt-12 text-[clamp(20px,2.5vw,27px)] max-w-[400px] leading-normal">
            {resolvedSubtitle}
          </p>

          <div className="mt-8 lg:mt-12">
            {!hideContent && (
              <Link href={resolvedHref}>
                <PrimaryButton className="px-8 py-4 lg:py-6 lg:min-w-[300px]">
                  {resolvedCta}
                </PrimaryButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
