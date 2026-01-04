'use client';

import { useState, useEffect } from 'react';
import Chevron from '@/components/ui/Buttons/Chevron';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setVisible(false);
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed 
        bottom-3 right-3 
        lg:bottom-8 lg:right-8 z-50 
        w-12 h-12 lg:w-16 lg:h-16 
        rounded-full flex items-center justify-center
        bg-transparent
        shadow-md hover:shadow-lg
        hover:bg-[#F3F2E3]
        focus:outline-none
        transition-all duration-300 ease-in-out
        ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <Chevron
        className="
          rotate-180 
          w-7 h-7 lg:w-10 lg:h-10
          text-black
        "
      />
    </button>
  );
}
