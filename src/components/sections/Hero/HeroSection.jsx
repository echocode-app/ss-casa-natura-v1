'use client';

import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';

import HeroSlide from './HeroSlide';
import HeroNavigation from './HeroNavigation';
import HeroProgress from './HeroProgress';

const defaultSlides = [
  { id: 1, image: '/images/pages/lavanda-baner.jpg', lineKey: 'lavanda' },
  { id: 2, image: '/images/home/banner.jpg', lineKey: 'brezza-marina' },
  { id: 3, image: '/images/pages/agrumi-di-sicilia-baner.jpg', lineKey: 'agrumi-di-sicilia' },
  { id: 4, image: '/images/pages/fiore-di-loto-baner.jpg', lineKey: 'fiore-di-loto' },
  { id: 5, image: '/images/pages/marsiglia-baner.jpg', lineKey: 'marsiglia' },
  { id: 6, image: '/images/pages/neutro-baner.jpg', lineKey: 'neutro' },
];

export default function HeroSection() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiper, setSwiper] = useState(null);
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    let mounted = true;
    fetch('/api/hero-banners')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const banners = Array.isArray(data?.banners) ? data.banners : [];
        if (!banners.length) return;

        setSlides(
          banners.map((b) => ({
            id: b._id,
            image: b.image,
            title: b.title,
            subtitle: b.text,
            href: b.href,
            cta: 'Scopri di più',
          })),
        );
      })
      .catch(() => {
        // keep fallback
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative w-full bg-brand-light overflow-x-hidden">
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        onBeforeInit={(swiperInstance) => {
          swiperInstance.params.navigation.prevEl = prevRef.current;
          swiperInstance.params.navigation.nextEl = nextRef.current;
        }}
        onSwiper={(swiperInstance) => setSwiper(swiperInstance)}
        className="relative"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <HeroSlide {...slide} />
          </SwiperSlide>
        ))}

        <HeroNavigation prevRef={prevRef} nextRef={nextRef} />
        {swiper && <HeroProgress swiper={swiper} total={slides.length} />}
      </Swiper>
    </section>
  );
}
