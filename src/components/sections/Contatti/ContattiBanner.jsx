'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function ContattiBanner() {
  const t = useTranslations('contatti');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, []);

  return (
    <section className="relative w-screen h-[300px] md:h-[472px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      <Image
        src="/images/pages/contatti-baner.jpg"
        alt="Contatti Banner"
        fill
        priority
        sizes="100vw"
        onLoadingComplete={() => setImageLoaded(true)}
        className="
          absolute
          top-0 left-0
          w-full h-full
          object-cover
          object-top
          transition-opacity duration-700 ease-out
        "
        style={{ opacity: imageLoaded ? 1 : 0 }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(43,41,41,0.2)]" />

      {/* Title */}
      <div className="mx-auto max-w-[1570px] relative z-10 h-full flex items-center px-4 md:px-16 lg:px-24">
        <h1 className="text-primary font-bold text-[clamp(36px,5vw,74px)] leading-[clamp(30px,5vw,46px)]">
          {t('bannerTitle')}
        </h1>
      </div>
    </section>
  );
}
