'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

import Arrow from '@/components/ui/Buttons/Arrow';
import { lineeConfig } from '@/lib/lineeConfig';
import LeLineeItem from '@/components/ui/LeLinee/LeLineeItem';
import { useTranslations } from 'next-intl';

export default function OtherLinesSection({ currentSlug }) {
  const t = useTranslations('linesSection');
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);

  const otherLines = Object.values(lineeConfig).filter((line) => line.slug !== currentSlug);

  useEffect(() => {
    const checkScreen = () => setIsLargeScreen(window.innerWidth >= 768);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const updateNavigation = (swiper) => {
    setCanSlidePrev(!swiper.isBeginning);
    setCanSlideNext(!swiper.isEnd);
  };

  const buttonBaseClass =
    'absolute top-1/2 -translate-y-1/2 z-20 w-[56px] h-[56px] xl:w-[74px] xl:h-[74px] rounded-full bg-brand-accent flex items-center justify-center transition-all duration-300';

  return (
    <section className="relative py-12 lg:py-20 overflow-hidden">
      <div className="relative mx-auto max-w-none md:max-w-[840px] lg:max-w-[1060px] xl:max-w-[1400px] px-4 md:px-12">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-10 md:mb-16">{t('title')}</h2>

        {isLargeScreen ? (
          <div className="relative">
            <button
              ref={prevRef}
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={!canSlidePrev}
              className={`${buttonBaseClass} -left-[6%] ${
                canSlidePrev
                  ? 'hover:shadow-header hover:opacity-90 cursor-pointer'
                  : 'opacity-40 cursor-auto'
              }`}
              aria-label="Previous slide"
            >
              <span className="rotate-180">
                <Arrow />
              </span>
            </button>

            <button
              ref={nextRef}
              onClick={() => swiperRef.current?.slideNext()}
              disabled={!canSlideNext}
              className={`${buttonBaseClass} -right-[6%] ${
                canSlideNext
                  ? 'hover:shadow-header hover:opacity-90 cursor-pointer'
                  : 'opacity-40 cursor-auto'
              }`}
              aria-label="Next slide"
            >
              <Arrow />
            </button>

            <Swiper
              modules={[Navigation]}
              spaceBetween={24}
              slidesPerView={2}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              onSlideChange={(swiper) => updateNavigation(swiper)}
              onSwiper={(swiper) => updateNavigation(swiper)}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
            >
              {otherLines.map((line) => (
                <SwiperSlide key={line.slug} className="flex justify-center w-auto">
                  <LeLineeItem
                    title={t(`lines.${line.slug}.title`)}
                    imageSrc={line.cardImage}
                    imageAlt={t(`lines.${line.slug}.imageAlt`)}
                    slug={line.slug}
                    variant="slider"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {otherLines.map((line) => (
              <div key={line.slug} className="flex-shrink-0 w-[240px]">
                <LeLineeItem
                  title={t(`lines.${line.slug}.title`)}
                  imageSrc={line.cardImage}
                  imageAlt={t(`lines.${line.slug}.imageAlt`)}
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
