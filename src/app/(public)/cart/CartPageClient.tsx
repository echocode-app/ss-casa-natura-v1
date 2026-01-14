'use client';

import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/ui/Сart/CartItem';
import CartEmpty from '@/components/ui/Сart/CartEmpty';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useEffect, useState } from 'react';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';
import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import {
  cartPromoErrorTranslationKey,
  normalizeCartPromoErrorCode,
} from '@/lib/utils/cartPromoMessages';

export function CartPageClient() {
  const t = useTranslations('user.cart');
  const tValidation = useTranslations('validation');
  const router = useRouter();
  const {
    items,
    isLoading,
    updateItem,
    removeItem,
    isInitializing,
    clearCart,
    applyPromoCode,
    removePromoCode,
    getItemCount,
    getSubtotal,
    getTotal,
    promoCode,
    promoDiscount,
    error,
  } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [promoEmail, setPromoEmail] = useState('');
  const [promoEmailError, setPromoEmailError] = useState('');

  const showInitSpinner = useSmoothLoading(isInitializing, 120, 300);
  const showActionSpinner = useSmoothLoading(isLoading && !isInitializing, 120, 220);
  const showPromoSpinner = useSmoothLoading(isApplyingPromo, 120, 220);

  useEffect(() => {
    setPromoEmail(user?.email || '');
  }, [user]);

  const isValidEmail = (email: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const totalQuantity = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();

  const withItemPending = async (itemId: string, action: () => Promise<void>) => {
    setActiveItemId(itemId);
    try {
      await action();
    } finally {
      setActiveItemId(null);
    }
  };

  const handleIncrease = async (itemId: string, currentQuantity: number) => {
    await withItemPending(itemId, () => updateItem(itemId, currentQuantity + 1));
  };

  const handleDecrease = async (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      await withItemPending(itemId, () => updateItem(itemId, currentQuantity - 1));
    }
  };

  const handleRemove = async (itemId: string) => {
    await withItemPending(itemId, () => removeItem(itemId));
  };

  const handleClearCart = async () => {
    await withItemPending('all', () => clearCart());
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoEmailError('');

    if (!isAuthenticated && !isValidEmail(promoEmail.trim())) {
      setPromoEmailError(tValidation('invalidEmail'));
      setIsApplyingPromo(false);
      return;
    }

    const emailToSend = isAuthenticated ? user?.email : promoEmail.trim();
    try {
      await applyPromoCode(promoInput.trim().toUpperCase(), emailToSend || undefined);
      setPromoInput('');
    } catch {
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    setIsApplyingPromo(true);
    try {
      await removePromoCode();
    } catch {
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleProceedToCheckout = () => {
    router.push('/checkout');
  };

  if (showInitSpinner) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !error.includes('promo')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="text-red-600 text-lg font-semibold" role="alert">
          {t('error', { defaultValue: 'Something went wrong. Please try again.' })}
        </div>
        <Link href="/prodotti" passHref>
          <PrimaryButton onClick={() => {}} className="px-8 py-4">
            {t('continueShopping', { defaultValue: 'Continue Shopping' })}
          </PrimaryButton>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <CartEmpty onClose={() => {}} />
        <Link href="/prodotti" passHref>
          <PrimaryButton onClick={() => {}} className="px-8 py-4">
            {t('continueShopping', { defaultValue: 'Continue Shopping' })}
          </PrimaryButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative max-w-[1570px] mx-auto px-6 md:px-8 lg:px-10 xl:px-12 py-8 lg:py-12">
      {showActionSpinner && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
          <Spinner size="lg" />
        </div>
      )}

      <h1 className="heading-default heading-sm lg:heading-lg mb-8 lg:mb-12">{t('title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* 📌 Cart Items */}
        <div className="flex-1">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                isUpdating={activeItemId === item.id}
                onIncrease={() => handleIncrease(item.id, item.quantity)}
                onDecrease={() => handleDecrease(item.id, item.quantity)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center">
            <Link href="/prodotti" className="text-brand-dark hover:underline">
              {t('continueShopping')}
            </Link>
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:underline text-sm"
              disabled={items.length === 0 || showActionSpinner}
            >
              {t('clearCart')}
            </button>
          </div>
        </div>

        {/* 📌 Cart Summary */}
        <div className="lg:w-[400px]">
          <div className="bg-background-secondary rounded-[20px] p-6 lg:p-8">
            <h2 className="font-semibold text-xl mb-6">{t('summary')}</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>
                  {totalQuantity} {t('items')}
                </span>
                <span className="font-semibold">€ {subtotal.toFixed(2)}</span>
              </div>

              {/* 📌 Promo Code Section */}
              {error && error.includes('promo') && (
                <div className="text-red-500 text-sm" role="alert">
                  {t(
                    cartPromoErrorTranslationKey(
                      normalizeCartPromoErrorCode(error.replace(/^promo:\s*/i, '')),
                    ),
                    { defaultValue: t('discountError') },
                  )}
                </div>
              )}
              {!promoCode ? (
                <div className="space-y-3">
                  {!isAuthenticated && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={promoEmail}
                        onChange={(e) => setPromoEmail(e.target.value)}
                        placeholder="nome@email.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      {promoEmailError && <p className="text-xs text-red-500">{promoEmailError}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('promoCode')}</label>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder={t('enterPromoCode')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      />
                      <PrimaryButton
                        onClick={handleApplyPromo}
                        disabled={
                          isApplyingPromo ||
                          !promoInput.trim() ||
                          (!isAuthenticated && !isValidEmail(promoEmail.trim()))
                        }
                        className="px-4 py-2 text-sm"
                      >
                        {showPromoSpinner ? <Spinner size="sm" colorScheme="light" /> : t('apply')}
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-50 p-3 rounded-md">
                  <div>
                    <span className="text-sm font-medium text-green-800">
                      {t('promoApplied')}: {promoCode}
                    </span>
                    {promoDiscount && promoDiscount > 0 && (
                      <span className="text-sm text-green-600 ml-2">
                        -€{promoDiscount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    disabled={isApplyingPromo}
                    className="text-red-500 hover:text-red-700 text-sm underline"
                  >
                    {showPromoSpinner ? <Spinner size="sm" colorScheme="muted" /> : t('remove')}
                  </button>
                </div>
              )}

              <div className="flex justify-between text-text-muted">
                <span>{t('shipping')}</span>
                <span>{t('calculated')}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('total')}</span>
                  <span>€ {total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-text-muted mt-1">{t('taxIncluded')}</p>
              </div>
            </div>

            <PrimaryButton
              onClick={handleProceedToCheckout}
              disabled={items.length === 0 || showActionSpinner}
              className="w-full mt-8 py-4"
            >
              {t('proceed')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
