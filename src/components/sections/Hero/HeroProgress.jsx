'use client';

import { useState, useEffect } from 'react';

export default function HeroProgress({ swiper, total }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!swiper) return;

    const updateIndex = () => setActiveIndex(swiper.realIndex);

    swiper.on('slideChange', updateIndex);

    setActiveIndex(swiper.realIndex);

    return () => {
      swiper.off('slideChange', updateIndex);
    };
  }, [swiper]);

  return (
    <div className="absolute bottom-6 left-0 w-full z-20 px-6">
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={`h-[3px] flex-1 transition-all duration-300 ${
              activeIndex === index ? 'bg-brand-accent' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
