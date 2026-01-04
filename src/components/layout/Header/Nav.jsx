'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import DropdownCategories from './DropdownCategories';

export default function Nav({ className = '', onDropdownChange }) {
  const t = useTranslations('header.nav');
  const pathname = usePathname();

  const prodottiRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const hideTimeout = useRef(null);

  const openDropdown = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setIsDropdownOpen(true);
    onDropdownChange?.(true);
  };

  const closeDropdown = useCallback(() => {
    hideTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
      onDropdownChange?.(false);
    }, 300);
  }, [onDropdownChange]);

  return (
    <nav
      className={`uppercase font-raleway font-normal text-[clamp(0.9rem,1.5vw,1.125rem)] flex gap-2 ${className}`}
    >
      <div
        ref={prodottiRef}
        className="relative flex flex-col items-center"
        onMouseEnter={openDropdown}
        onMouseLeave={closeDropdown}
      >
        <Link
          href="/prodotti"
          onClick={() => {
            setIsDropdownOpen(false);
            onDropdownChange?.(false);
          }}
          className={`
            relative py-20 px-[clamp(6px,2vw,30px)]
            transition-all duration-300
            after:absolute after:left-1/2 after:bottom-0 after:w-0 after:h-[6px]
            after:-translate-x-1/2 after:bg-brand-accent after:transition-all
            hover:after:w-[50%] focus:after:w-[80%]
            hover:font-semibold focus:font-semibold
            ${pathname === '/prodotti' ? 'after:w-full font-semibold' : ''}
          `}
        >
          {t('products')}
        </Link>

        <DropdownCategories
          parentRef={prodottiRef}
          isOpen={isDropdownOpen}
          onClose={() => {
            setIsDropdownOpen(false);
            onDropdownChange?.(false);
          }}
        />
      </div>

      {[
        { href: '/linee', label: t('lines') },
        { href: '/mission', label: t('mission') },
        { href: '/contatti', label: t('contacts') },
      ].map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              relative py-20 px-[clamp(6px,2vw,30px)]
              transition-all duration-300
              after:absolute after:left-1/2 after:bottom-0 after:w-0 after:h-[6px]
              after:-translate-x-1/2 after:bg-brand-accent after:transition-all
              hover:after:w-[50%] focus:after:w-[80%]
              hover:font-semibold focus:font-semibold
              ${isActive ? 'after:w-full font-semibold' : ''}
            `}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
