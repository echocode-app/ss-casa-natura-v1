'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Logo from './Logo';
import Nav from './Nav';
import HeaderIcons from './HeaderIcons';
import MobileMenu from './MobileMenu';
import { Menu, Search } from '@/components/ui/Buttons';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fixed, setFixed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);
  const lastScroll = useRef(0);
  const scrollTimeout = useRef(null);
  const t = useTranslations('header.actions');

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [menuOpen]);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    let ticking = false;
    const thresholdDown = 5;
    const thresholdUp = 5;

    const hideDelay = 50;
    const showDelay = 10;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const current = window.scrollY;
        setFixed(current > 0);

        if (current > lastScroll.current + thresholdDown) {
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
          scrollTimeout.current = setTimeout(() => setVisible(false), hideDelay);
        } else if (current < lastScroll.current - thresholdUp || current === 0) {
          if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
          scrollTimeout.current = setTimeout(() => setVisible(true), showDelay);
        }

        lastScroll.current = current;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    setHeaderHeight(headerRef.current.offsetHeight);

    const onResize = () => setHeaderHeight(headerRef.current.offsetHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  return (
    <>
      {fixed && <div style={{ height: headerHeight }} />}

      <header
        ref={headerRef}
        className={`
          bg-brand-light
          shadow-header
          ${fixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative'}
          transition-transform duration-300 ease-in-out
          ${visible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="mx-auto max-w-[1570px] px-6 md:pl-16 xl:pl-24 md:pr-10">
          {/* MOBILE HEADER */}
          <div className="md:hidden grid grid-cols-[auto_1fr_auto] items-center relative">
            <div className="flex items-center">
              <button onClick={() => setMenuOpen(true)} aria-label={t('openMenu')} className="p-1">
                <Menu className="w-6 h-6" />
              </button>
              <Search className="w-6 h-6" />
            </div>

            <div className="flex justify-center">
              <Logo />
            </div>

            <div className="flex items-center justify-end gap-3">
              <HeaderIcons isMobile={true} />
            </div>
          </div>

          {/* TABLET + DESKTOP HEADER */}
          <div className="hidden md:flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-[clamp(20px,2vw,80px)] relative">
              <Nav />
              <HeaderIcons />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && <MobileMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />}
    </>
  );
}
