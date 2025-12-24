'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ isScrolled = false, className = '' }) {
  const pathname = usePathname();

  const links = [
    { href: '/prodotti', label: 'Prodotti' },
    { href: '/linee', label: 'Linee' },
    { href: '/mission', label: 'Mission' },
    { href: '/contatti', label: 'Contatti' },
  ];

  return (
    <nav
      className={`uppercase font-raleway font-normal text-[clamp(0.9rem,1.5vw,1.125rem)] flex gap-[clamp(6px,2vw,30px)] ${className}`}
    >
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`
              relative
              transition-all duration-500 ease-out
              px-[10px]
              ${
                isScrolled
                  ? 'xl:py-[34px] lg:py-[28px] md:py-[23px]'
                  : 'xl:py-[65px] lg:py-[58px] md:py-[33px]'
              }
              after:absolute after:left-1/2 after:bottom-0 after:w-0 after:h-[6px] 
              after:-translate-x-1/2 after:translate-y-[10px] after:bg-brand-accent
              after:transition-all after:duration-300
              hover:after:w-[70%] focus:after:w-[90%]
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
