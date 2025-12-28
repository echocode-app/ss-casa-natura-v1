'use client';

import React from 'react';

export default function LineBannerSection({ title, backgroundSrc }) {
  return (
    <section className="relative w-screen h-[300px] md:h-[472px] overflow-hidden">
      <img
        src={backgroundSrc}
        alt={title}
        className="
          absolute
          top-1/2 lg:top-[70%] left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-[150%] md:w-[130%] lg:w-[120%] xl:w-[100%]
          h-auto
          object-cover
  "
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(36,22,22,0.2)]" />

      {/* Title */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <h1
          className="font-semibold text-[clamp(32px,5vw,43px)]
        leading-[31px] text-text-inverse
        "
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
