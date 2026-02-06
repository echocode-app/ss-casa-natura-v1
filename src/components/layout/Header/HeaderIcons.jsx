'use client';

import { Cart, User, Search } from '@/components/ui/Buttons';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthModal from '@/components/ui/Modal/AuthModal';
import { useTranslations } from 'next-intl';

export default function HeaderIcons({
  className = '',
  isMobile = false,
  onSearchClick,
  onCartClick,
}) {
  const { getItemCount, isInitializing } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const t = useTranslations('header.icons');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const size = isMobile ? 'w-6 h-6' : 'w-5 h-5 md:w-6 md:h-6';
  const iconClass = `${size} transition-transform duration-300 will-change-transform 
     group-hover:scale-105 group-focus-visible:scale-105`;

  const btn = 'group px-2 py-6 lg:py-8 outline-none focus:outline-none relative';

  const itemCount = isInitializing ? 0 : getItemCount();

  // Handle user button click - redirect or open modal.
  const handleUserButtonClick = () => {
    if (isAuthenticated) {
      // Authenticated user - go to account.
      router.push('/account');
    } else {
      // Not authenticated - open modal.
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className={`flex items-center ${className}`}>
        {!isMobile && (
          <button type="button" onClick={onSearchClick} aria-label={t('search')} className={btn}>
            <Search className={iconClass} />
          </button>
        )}

        <button
          type="button"
          onClick={handleUserButtonClick}
          aria-label={t('user')}
          className={btn}
        >
          <User className={iconClass} />
        </button>

        <button type="button" aria-label={t('cart')} onClick={onCartClick} className={btn}>
          <Cart className={iconClass} />
          {itemCount > 0 && (
            <span className="absolute top-4 right-0 lg:top-5 lg:right-0 bg-background-green text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialType="login"
      />
    </>
  );
}
