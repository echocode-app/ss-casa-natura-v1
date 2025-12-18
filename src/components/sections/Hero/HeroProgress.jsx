"use client";

import { useSwiper } from "swiper/react";

export default function HeroProgress({ total }) {
  const swiper = useSwiper();

  return (
    <div className="absolute bottom-6 left-0 w-full z-20 px-6">
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={`
              h-[3px] flex-1
              transition-all duration-300
              ${
                swiper?.activeIndex === index
                  ? "bg-brand-accent"
                  : "bg-white/40"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
