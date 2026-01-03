'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import DropdownCategories from './DropdownCategories';

export default function Nav({ className = '' }) {
  const pathname = usePathname();
  const prodottiRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const links = [
    { href: '/prodotti', label: 'Prodotti', hasDropdown: true },
    { href: '/linee', label: 'Linee' },
    { href: '/mission', label: 'Mission' },
    { href: '/contatti', label: 'Contatti' },
  ];

  return (
    <nav
      className={`uppercase font-raleway font-normal text-[clamp(0.9rem,1.5vw,1.125rem)] flex gap-2 ${className}`}
    >
      {links.map((link) => {
        const isActive = pathname === link.href;

        if (link.hasDropdown) {
          return (
            <div
              key={link.href}
              className="relative flex flex-col items-center"
              ref={prodottiRef}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <Link
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

              <DropdownCategories parentRef={prodottiRef} isHovered={hovered} />
            </div>
          );
        }

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
