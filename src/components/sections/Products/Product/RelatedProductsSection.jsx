import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ProductCard } from '@/components/ui/Products';

export default function RelatedProductsSection({ products }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  if (!products || products.length === 0) return null;

  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [products]);

  return (
    <section className="py-16 xl:py-20 relative">
      <div className="max-w-[1570px] mx-auto px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-8 text-center">
          Ti potrebbero interessare
        </h2>

        <Swiper
          modules={[Navigation]}
          slidesPerView={2}
          spaceBetween={16}
          breakpoints={{
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 32 },
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {products.map((p) => (
            <SwiperSlide key={p.id}>
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

        {/* Navigation arrows */}
        <button
          ref={prevRef}
          className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
        >
          ←
        </button>
        <button
          ref={nextRef}
          className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
        >
          →
        </button>
      </div>
    </section>
  );
}
