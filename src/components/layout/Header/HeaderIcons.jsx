'use client';

import { Cart, User, Search } from '@/components/ui/Buttons';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/layout/AuthContext';

export default function HeaderIcons({
  className = '',
  isMobile = false,
  onSearchClick,
  onCartClick,
  onUserClick,
}) {
  const { getItemCount, isInitializing } = useCart();
  const { isAuthenticated } = useAuth();

  const size = isMobile ? 'w-6 h-6' : 'w-5 h-5 md:w-6 md:h-6';
  const iconClass = `${size} transition-transform duration-300 will-change-transform 
     group-hover:scale-105 group-focus-visible:scale-105`;

  const btn = 'group px-2 py-6 lg:py-8 outline-none focus:outline-none relative';

  const itemCount = isInitializing ? 0 : getItemCount();

  return (
    <div className={`flex items-center ${className}`}>
      {!isMobile && (
        <button type="button" onClick={onSearchClick} aria-label="Search" className={btn}>
          <Search className={iconClass} />
        </button>
      )}

      <button type="button" onClick={onUserClick} aria-label="User" className={btn}>
        <User className={iconClass} />
      </button>

      <button type="button" aria-label="Cart" onClick={onCartClick} className={btn}>
        <Cart className={iconClass} />
        {itemCount > 0 && (
          <span className="absolute top-4 right-0 lg:top-5 lg:right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
    </div>
  );
}
