'use client';

import { Cart, User, Search } from '@/components/ui/Buttons';

export default function HeaderIcons({
  className = '',
  isMobile = false,
  onSearchClick,
  onUserClick,
}) {
  const size = isMobile ? 'w-6 h-6' : 'w-5 h-5 md:w-6 md:h-6';

  const btn = 'group px-2 py-6 lg:py-8 outline-none focus:outline-none';

  const icon = `${size} transition-transform duration-300 will-change-transform 
     group-hover:scale-105 group-focus-visible:scale-105`;

  return (
    <div className={`flex items-center ${className}`}>
      {!isMobile && (
        <button type="button" onClick={onSearchClick} aria-label="Search" className={btn}>
          <Search className={icon} />
        </button>
      )}

      <button type="button" onClick={onUserClick} aria-label="User" className={btn}>
        <User className={icon} />
      </button>

      <button type="button" aria-label="Cart" className={btn}>
        <Cart className={icon} />
      </button>
    </div>
  );
}
