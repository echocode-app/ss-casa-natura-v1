'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import Arrow from '@/components/ui/Buttons/Arrow';
import { ProductCard } from '@/components/ui/Products';
import { WaveBackground } from '@/components/ui/Parts';
import { useTranslations } from 'next-intl';

export default function RelatedProductsSection({ products }) {
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [maxCardHeight, setMaxCardHeight] = useState(0);
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);
  const t = useTranslations('prodotti.related');

  if (!products || products.length === 0) return null;

  const buttonBaseClass = `
    bg-[#F3F2E3]
    absolute top-1/2 -translate-y-1/2 z-20 
    w-[40px] h-[40px] md:w-[50px] md:h-[50px] xl:w-[70px] xl:h-[70px] 
    rounded-full flex items-center justify-center 
    transition-all duration-300
    cursor-pointer
  `;

  useEffect(() => {
    const resizeCards = () => {
      if (!swiperRef.current) return;
      const slides = swiperRef.current.slides;
      let maxHeight = 0;

      slides.forEach((slide) => {
        const card = slide.querySelector('a');
        if (card) {
          card.style.height = 'auto';
          maxHeight = Math.max(maxHeight, card.offsetHeight);
        }
      });

      setMaxCardHeight(maxHeight);
    };

    resizeCards();
    window.addEventListener('resize', resizeCards);
    return () => window.removeEventListener('resize', resizeCards);
  }, [products]);

  return (
    <section className="py-16 md:py-20 lg:py-24 relative overflow-x-visible">
      <WaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-10 lg:mb-20 text-center">
          {t('title')}
        </h2>

        <div className="relative">
          {/* arrows */}
          <button
            ref={prevRef}
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={!canSlidePrev}
            className={`${buttonBaseClass} hidden md:flex -left-[2%] ${
              canSlidePrev
                ? 'hover:shadow-header hover:opacity-80 focus:shadow-header focus:opacity-80'
                : 'opacity-40 cursor-auto pointer-events-none'
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
            className={`${buttonBaseClass} hidden md:flex -right-[2%] ${
              canSlideNext
                ? 'hover:shadow-header hover:opacity-80 focus:shadow-header focus:opacity-80'
                : 'opacity-40 cursor-auto pointer-events-none'
            }`}
            aria-label="Next slide"
          >
            <Arrow />
          </button>

          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            onSlideChange={(swiper) => {
              setCanSlidePrev(!swiper.isBeginning);
              setCanSlideNext(!swiper.isEnd);
            }}
            onSwiper={(swiper) => {
              setCanSlidePrev(!swiper.isBeginning);
              setCanSlideNext(!swiper.isEnd);
            }}
            slidesPerView="auto"
            spaceBetween={16}
            breakpoints={{
              768: { spaceBetween: 16 },
              1024: { spaceBetween: 24 },
              1280: { spaceBetween: 36 },
            }}
            loop={false}
            watchOverflow
            speed={400}
            className="py-4"
          >
            {products.map((p) => (
              <SwiperSlide
                key={p.id}
                className="flex justify-center items-stretch"
                style={{
                  width: 'clamp(260px, 23%, 363px)',
                  height: maxCardHeight ? `${maxCardHeight}px` : 'auto',
                }}
              >
                <ProductCard
                  title={p.title}
                  volume={p.variants?.[0]?.volume ?? null}
                  price={p.price}
                  imageSrc={p.images?.[0]?.src}
                  slug={p.slug}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
