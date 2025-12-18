'use client';

import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';

import HeroSlide from './HeroSlide';
import HeroNavigation from './HeroNavigation';
import HeroProgress from './HeroProgress';

const slides = [
  {
    id: 1,
    image: '/images/home/banner.jpg',
    title: 'Freschezza Oceanica per la tua casa',
    subtitle:
      'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti',
    cta: 'Scopri i prodotti',
  },
  {
    id: 2,
    image: '/images/pages/mission-baner.jpg',
    title: 'Freschezza Oceanica per la tua casa',
    subtitle:
      'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti',
    cta: 'Scopri i prodotti',
  },
  {
    id: 3,
    image: '/images/pages/mission-img.jpg',
    title: 'Freschezza Oceanica per la tua casa',
    subtitle:
      'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti',
    cta: 'Scopri i prodotti',
  },
  {
    id: 4,
    image: '/images/pages/contatti-baner.jpg',
    title: 'Freschezza Oceanica per la tua casa',
    subtitle:
      'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti',
    cta: 'Scopri i prodotti',
  },
  {
    id: 5,
    image: '/images/pages/mission-baner.jpg',
    title: 'Freschezza Oceanica per la tua casa',
    subtitle:
      'Scopri la linea Brezza Marina: detergenti naturali che portano l’aria del mare nei tuoi ambienti',
    cta: 'Scopri i prodotti',
  },
];

export default function HeroSection() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiper, setSwiper] = useState(null);

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
