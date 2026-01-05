'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Logo from './Logo';
import Nav from './Nav';
import HeaderIcons from './HeaderIcons';
import MobileMenu from './MobileMenu';
import { Menu, Search } from '@/components/ui/Buttons';
import SearchModal from '@/components/ui/Modal/SearchModal';
import AuthModal from '@/components/ui/Modal/AuthModal';

export default function Header({ isUserLoggedIn = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fixed, setFixed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const headerRef = useRef(null);
  const lastScroll = useRef(0);
  const scrollTimeout = useRef(null);
  const t = useTranslations('header.actions');

  const forcedVisible = menuOpen || searchOpen || authOpen;

  /* ================= Mobile menu scroll lock ================= */

  useEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  /* ================= Dropdown scroll lock ================= */

  useEffect(() => {
    if (!dropdownOpen) return;
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [dropdownOpen]);

  /* ================= Header hide / show ================= */

  useEffect(() => {
    if (window.innerWidth < 768) return;
    let ticking = false;
    const thresholdDown = 5;
    const thresholdUp = 5;
    const hideDelay = 50;
    const showDelay = 10;

    const onScroll = () => {
      if (forcedVisible) return;
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
  }, [forcedVisible]);

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
          ${fixed ? 'fixed top-0 left-0 right-0 z-30' : 'relative'}
          transition-transform duration-300 ease-in-out
          ${forcedVisible || visible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="mx-auto max-w-[1570px] px-6 md:pl-16 xl:pl-24 md:pr-10">
          {/* Mobile */}
          <div className="md:hidden grid grid-cols-[auto_1fr_auto] items-center relative">
            {/* Left: Menu + Search */}
            <div className="flex items-center gap-1">
              <button onClick={() => setMenuOpen(true)} aria-label={t('openMenu')} className="p-1">
                <Menu className="w-6 h-6" />
              </button>
              <button onClick={() => setSearchOpen(true)} className="p-1">
                <Search className="w-6 h-6" />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Logo />
            </div>

            {/* Right: HeaderIcons */}
            <div className="flex items-center justify-end gap-3">
              <HeaderIcons isMobile onUserClick={() => !isUserLoggedIn && setAuthOpen(true)} />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-[clamp(20px,2vw,80px)] relative">
              <Nav onDropdownChange={setDropdownOpen} />
              <HeaderIcons
                onSearchClick={() => setSearchOpen(true)}
                onUserClick={() => !isUserLoggedIn && setAuthOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {menuOpen && <MobileMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />}
      {searchOpen && <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
      {authOpen && <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />}
    </>
  );
}
