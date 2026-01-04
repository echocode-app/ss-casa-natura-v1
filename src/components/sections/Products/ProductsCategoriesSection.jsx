'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import 'swiper/css';
import 'swiper/css/navigation';

import Arrow from '@/components/ui/Buttons/Arrow';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';

export default function ProductsCategoriesSection() {
  const c = useTranslations('categories');
  const t = useTranslations('prodotti.categories');

  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [canSlide, setCanSlide] = useState(false);

  useEffect(() => {
    setCanSlide(PRODUCT_CATEGORIES.length > 4);
  }, []);

  const buttonBaseClass = `
    bg-[#F3F2E3]
    absolute top-1/2 -translate-y-1/2 z-20 
    w-[40px] h-[40px] md:w-[50px] md:h-[50px] xl:w-[70px] xl:h-[70px] 
    rounded-full flex items-center justify-center 
    transition-all duration-300
    hover:shadow-header hover:opacity-80 cursor-pointer
  `;

  const renderCategory = (category) => {
    const label = c.has(category.title) ? c(category.title) : category.title;

    return (
      <Link
        key={category.id}
        href={`/prodotti?subcategory=${category.id}`}
        className="group flex flex-col items-center gap-2 lg:gap-3 focus:outline-none py-1"
      >
        <div
          className="bg-brand-accent rounded-full overflow-hidden flex items-center justify-center
            transition-all duration-300 md:group-hover:shadow-header md:group-focus:shadow-header"
          style={{ width: '100%', aspectRatio: '1 / 1' }}
        >
          <img
            src={category.image || '/images/categories/products.png'}
            alt={label}
            className="max-w-[80%] max-h-[80%] object-contain"
          />
        </div>

        <span className="text-center" style={{ fontSize: 'clamp(16px, 1.3vw, 23px)' }}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <section className="py-10 xl:py-14 relative overflow-x-visible">
      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h1 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-8 md:mb-12 xl:mb-16 text-center">
          {t('title')}
          <br />
          <span className="heading-accent">{t('subtitle')}</span>
        </h1>

        {!canSlide ? (
          <div className="flex justify-center flex-wrap gap-6">
            {PRODUCT_CATEGORIES.map((category) => (
              <div key={category.id} style={{ width: 'clamp(120px, 16%, 200px)' }}>
                {renderCategory(category)}
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <button
              ref={prevRef}
              onClick={() => swiperRef.current?.slidePrev()}
              className={`${buttonBaseClass} hidden md:flex -left-[2%]`}
              aria-label="Previous slide"
            >
              <span className="rotate-180">
                <Arrow />
              </span>
            </button>

            <button
              ref={nextRef}
              onClick={() => swiperRef.current?.slideNext()}
              className={`${buttonBaseClass} hidden md:flex -right-[2%]`}
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
              slidesPerView="auto"
              spaceBetween={30}
              breakpoints={{
                768: { spaceBetween: 20 },
                1024: { spaceBetween: 30 },
                1280: { spaceBetween: 50 },
              }}
              loop={false}
              watchOverflow
              speed={400}
              className="py-4"
            >
              {PRODUCT_CATEGORIES.map((category) => (
                <SwiperSlide
                  key={category.id}
                  className="flex justify-center items-center"
                  style={{ width: 'clamp(120px, 16%, 200px)' }}
                >
                  {renderCategory(category)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}
