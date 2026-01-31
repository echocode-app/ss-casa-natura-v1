'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function BannerSection({ title, subtitle, backgroundSrc }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [backgroundSrc]);

  return (
    <section className="relative w-full min-h-[76svh] flex items-center overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      <Image
        src={backgroundSrc}
        alt="Banner"
        fill
        priority
        sizes="100vw"
        onLoadingComplete={() => setImageLoaded(true)}
        className={`object-cover w-full h-full transition-opacity duration-700 ease-out ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10 w-full max-w-[1570px] mx-auto px-8 md:px-10 xl:px-12 pl-8 md:pl-24 xl:pl-28">
        <h1 className="sr-only">{title}</h1>

        <h2 className="font-raleway font-bold text-[clamp(36px,6vw,74px)] leading-[0.95] max-w-[890px] text-primary">
          {title}
        </h2>

        <p className="mt-6 font-raleway text-[clamp(18px,2.5vw,24px)] max-w-[600px] leading-[100%]">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
