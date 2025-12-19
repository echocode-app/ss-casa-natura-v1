'use client';

import { useState, useEffect } from 'react';

import Logo from './Logo';
import Nav from './Nav';
import HeaderIcons from './HeaderIcons';
import MobileMenu from './MobileMenu';

import { Menu, Search, User, Cart } from '@/components/ui/Buttons';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // lock body on mobile menu
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // scroll shrink (md+ only)
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth >= 768) {
        setIsScrolled(window.scrollY > 10);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-brand-light shadow-header">
      <div
        className={`
          mx-auto max-w-[1570px]
          px-4
          transition-[padding] duration-300 ease-out
          md:pl-20 xl:pl-24
          ${isScrolled ? 'pt-1 pb-1' : 'pt-4 pb-4'}
        `}
      >
        {/* ================= MOBILE ================= */}
        <div
          className="
            md:hidden
            grid grid-cols-[auto_1fr_auto]
            items-center gap-2
            relative
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="transition-transform hover:scale-105"
            >
              <Menu className="w-2 h-2" />
            </button>
            <Search className="w-2 h-2 transition-transform hover:scale-105" />
          </div>

          {/* CENTER */}
          <div className="flex justify-center">
            <Logo />
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-6">
            <User className="w-5 h-5" />
            <Cart className="w-5 h-5" />
          </div>
        </div>

        {/* ================= TABLET + DESKTOP ================= */}
        <div className="hidden md:flex items-center justify-between">
          <Logo isScrolled={isScrolled} />

          <div className="flex items-center gap-[clamp(20px,2vw,70px)]">
            <Nav />
            <HeaderIcons />
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && <MobileMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />}
    </header>
  );
}
