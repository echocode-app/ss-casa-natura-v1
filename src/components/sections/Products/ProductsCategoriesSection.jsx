'use client';

import { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/navigation';
import Arrow from '@/components/ui/Buttons/Arrow';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';

export default function ProductsCategoriesSection() {
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [canSlide, setCanSlide] = useState(false);

  useEffect(() => {
    setCanSlide(PRODUCT_CATEGORIES.length > 5);
  }, []);

  const buttonBaseClass = `
    bg-[#F3F2E3]
    absolute top-1/2 -translate-y-1/2 z-20 
    w-[40px] h-[40px] md:w-[50px] md:h-[50px] xl:w-[70px] xl:h-[70px] 
    rounded-full flex items-center justify-center 
    transition-all duration-300
    hover:shadow-header hover:opacity-80 cursor-pointer
  `;

  return (
    <section className="py-10 xl:py-14 relative overflow-x-visible">
      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h1 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-8 md:mb-12 xl:mb-16">
          Benvenuti nel mondo di Casa Natura
          <br />
          <span className="heading-accent">Scopri i nostri prodotti</span>
        </h1>

        <div className="relative">
          {canSlide && (
            <>
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
            </>
          )}

          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
              if (canSlide) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
            }}
            slidesPerView="auto"
            centeredSlides={!canSlide}
            spaceBetween={12}
            loop={canSlide}
            watchOverflow={true}
            className="py-4"
          >
            {PRODUCT_CATEGORIES.map((category) => {
              const imageSrc = category.image || '/images/categories/products.png';
              return (
                <SwiperSlide
                  key={category.id}
                  className="flex justify-center items-center mx-auto"
                  style={{ width: 'auto' }}
                >
                  <Link
                    href={`/prodotti/${category.slug}`}
                    className="group flex flex-col items-center gap-2 lg:gap-3 focus:outline-none py-1"
                  >
                    <div
                      className="bg-brand-accent rounded-full overflow-hidden flex items-center justify-center
                                 transition-all duration-300
                                 group-hover:shadow-header
                                 group-focus:shadow-header"
                      style={{
                        width: 'clamp(120px, 13vw, 200px)',
                        height: 'clamp(120px, 13vw, 200px)',
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt={category.title}
                        className="max-w-[80%] max-h-[80%] object-contain"
                      />
                    </div>
                    <span className="text-center" style={{ fontSize: 'clamp(16px, 1.3vw, 23px)' }}>
                      {category.title}
                    </span>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
