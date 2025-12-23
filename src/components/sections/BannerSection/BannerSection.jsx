'use client';

import Image from 'next/image';
import React from 'react';

export default function BannerSection({ title, subtitle, backgroundSrc }) {
  return (
    <section className="relative w-full min-h-[76svh] flex items-center overflow-x-hidden">
      <Image src={backgroundSrc} alt="Banner" fill className="object-cover w-full h-full" />

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
