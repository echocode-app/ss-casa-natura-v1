'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

import Arrow from '@/components/ui/Buttons/Arrow';
import { lineeConfig } from '@/lib/lineeConfig';
import LeLineeItem from '@/components/ui/LeLinee/LeLineeItem';

export default function OtherLinesSection({ currentSlug }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const lineOrder = [
    'lavanda',
    'brezza-marina',
    'agrumi-di-sicilia',
    'fiore-di-loto',
    'marsiglia',
    'neutro',
  ];

  const currentIndex = lineOrder.indexOf(currentSlug);

  const otherLines = [
    ...lineOrder.slice(currentIndex + 1),
    ...lineOrder.slice(0, currentIndex),
  ].map((slug) => lineeConfig[slug]);

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return (
    <section className="relative py-12 lg:py-20 overflow-hidden">
      <div className="relative mx-auto max-w-none md:max-w-[760px] lg:max-w-[1010px] xl:max-w-[1400px] px-4 md:px-12">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-10 md:mb-16">
          Scopri le altre linee
        </h2>

        {isLargeScreen ? (
          // MD / LG+ → Swiper
          <div className="relative">
            <button
              ref={prevRef}
              className="absolute top-1/2 -translate-y-1/2 -left-[6%] z-20 w-[56px] h-[56px] xl:w-[74px] xl:h-[74px] rounded-full bg-brand-accent flex items-center justify-center transition-all duration-300 hover:shadow-header hover:opacity-90"
              aria-label="Previous slide"
            >
              <span className="rotate-180">
                <Arrow />
              </span>
            </button>

            <button
              ref={nextRef}
              className="absolute top-1/2 -translate-y-1/2 -right-[6%] z-20 w-[56px] h-[56px] xl:w-[74px] xl:h-[74px] rounded-full bg-brand-accent flex items-center justify-center transition-all duration-300 hover:shadow-header hover:opacity-90"
              aria-label="Next slide"
            >
              <Arrow />
            </button>

            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={2} // MD
              loop={false}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                  centeredSlides: false,
                },
                1024: {
                  slidesPerView: 3,
                  centeredSlides: false,
                },
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
            >
              {otherLines.map((line) => (
                <SwiperSlide key={line.slug} className="flex justify-center w-auto">
                  <LeLineeItem
                    title={line.title}
                    imageSrc={line.cardImage}
                    slug={line.slug}
                    variant="slider"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          // ===========================
          <div className="flex gap-4 overflow-x-auto pb-4">
            {otherLines.map((line) => (
              <div key={line.slug} className="flex-shrink-0 w-[240px]">
                <LeLineeItem
                  title={line.title}
                  imageSrc={line.cardImage}
                  slug={line.slug}
                  variant="slider"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
