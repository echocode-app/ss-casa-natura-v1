'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';

import HeroSlide from './HeroSlide';
import HeroNavigation from './HeroNavigation';
import HeroProgress from './HeroProgress';

const fallbackSlide = { id: 'fallback', useFallback: true };
const loadingSlide = { id: 'loading', hideContent: true, useFallback: false };

export default function HeroSection() {
  const locale = useLocale();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiper, setSwiper] = useState(null);
  const [slides, setSlides] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let mounted = true;
    fetch('/api/hero-banners')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        const banners = Array.isArray(data?.banners) ? data.banners : [];
        if (!banners.length) {
          setSlides([fallbackSlide]);
          setStatus('fallback');
          return;
        }

        setSlides(
          banners.map((b) => ({
            id: b._id,
            image: b.image,
            title:
              locale === 'en'
                ? b.titleEn || b.title || b.titleIt
                : b.titleIt || b.title || b.titleEn,
            subtitle:
              locale === 'en'
                ? b.subtitleEn || b.text || b.subtitleIt
                : b.subtitleIt || b.text || b.subtitleEn,
            href: b.href,
            cta:
              locale === 'en'
                ? b.ctaEn || b.cta || 'Learn more'
                : b.ctaIt || b.cta || 'Scopri di più',
          })),
        );
        setStatus('ready');
      })
      .catch(() => {
        if (!mounted) return;
        setSlides([fallbackSlide]);
        setStatus('fallback');
      });

    return () => {
      mounted = false;
    };
  }, [locale]);

  const renderSlides =
    status === 'ready' ? slides : status === 'fallback' ? [fallbackSlide] : [loadingSlide];

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
        {renderSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <HeroSlide {...slide} />
          </SwiperSlide>
        ))}

        <HeroNavigation prevRef={prevRef} nextRef={nextRef} />
        {swiper && <HeroProgress swiper={swiper} total={renderSlides.length} />}
      </Swiper>
    </section>
  );
}
