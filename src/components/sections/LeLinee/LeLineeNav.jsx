'use client';

import Link from 'next/link';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Linee', href: '/linee' },
];

export default function LeLineeNav({ currentLine }) {
  return (
    <section className="py-5 lg:py-7">
      <div
        className="
          flex flex-wrap gap-2 items-center
          max-w-[1570px] mx-auto
          px-6 md:px-8 lg:px-10 xl:px-12
          text-[clamp(14px,2vw,17px)] leading-[clamp(24px,2vw,31px)]
         text-text-primary
        "
      >
        {navItems.map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            <Link
              href={item.href}
              className="transition-all duration-300 hover:underline text-text-primary"
            >
              {item.label}
            </Link>
            <span className="text-text-primary">|</span>
          </span>
        ))}

        {currentLine && <span className="text-[#545454] underline">{currentLine}</span>}
      </div>
    </section>
  );
}
