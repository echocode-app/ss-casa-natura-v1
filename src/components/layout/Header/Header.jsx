"use client";

import { useState, useEffect } from "react";

import Logo from "./Logo";
import Nav from "./Nav";
import HeaderIcons from "./HeaderIcons";
import MobileMenu from "./MobileMenu";

import { Menu, Search, User, Cart } from "@/components/ui/Buttons";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-brand-light shadow-header">
      <div className="mx-auto max-w-[1571px] px-2 md:px-4 md:py-2">
        {/* ================= MOBILE ================= */}
        <div
          className="
            md:hidden
            grid
            grid-cols-[auto_1fr_auto]
            items-center
            gap-2
            relative
          "
        >
          {/* LEFT: burger + search */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="hover:scale-105 transition-transform will-change-transform"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Search className="w-5 h-5 hover:scale-105 transition-transform will-change-transform" />
          </div>

          {/* CENTER: logo */}
          <div className="flex justify-center">
            <Logo />
          </div>

          {/* RIGHT: user + cart */}
          <div className="flex items-center justify-end gap-6">
            <User className="w-5 h-5" />
            <Cart className="w-5 h-5" />
          </div>
        </div>

        {/* ================= TABLET + DESKTOP ================= */}
        <div className="hidden md:flex items-center justify-between">
          {/* LEFT: logo */}
          <Logo />

          {/* RIGHT: nav + icons */}
          <div className="flex items-center align-baseline gap-[clamp(50px,2vw,80px)]">
            <Nav />
            <HeaderIcons />
          </div>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <MobileMenu isOpen={menuOpen} closeMenu={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
