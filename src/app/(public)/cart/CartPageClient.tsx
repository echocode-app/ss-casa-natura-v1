'use client';

import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/ui/Сart/CartItem';
import CartEmpty from '@/components/ui/Сart/CartEmpty';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useState } from 'react';

export function CartPageClient() {
  const t = useTranslations('user.cart');
  const {
    items,
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

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const totalQuantity = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();

  const handleIncrease = async (itemId: string, currentQuantity: number) => {
    await updateItem(itemId, currentQuantity + 1);
  };

  const handleDecrease = async (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      await updateItem(itemId, currentQuantity - 1);
    }
  };

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    try {
      await applyPromoCode(promoInput.trim().toUpperCase());
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

  if (isInitializing) {
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
    <div className="max-w-[1570px] mx-auto px-6 md:px-8 lg:px-10 xl:px-12 py-8 lg:py-12">
      <h1 className="heading-default heading-sm lg:heading-lg mb-8 lg:mb-12">{t('title')}</h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* 📌 Cart Items */}
        <div className="flex-1">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
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
              disabled={items.length === 0}
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
                  {t('discountError', { defaultValue: 'Invalid code, please try again' })}
                </div>
              )}
              {!promoCode ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('promoCode')}</label>
                  <div className="flex gap-2">
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
                      disabled={isApplyingPromo || !promoInput.trim()}
                      className="px-4 py-2 text-sm"
                    >
                      {isApplyingPromo ? '...' : t('apply')}
                    </PrimaryButton>
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
                    {t('remove')}
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

            <PrimaryButton onClick={() => {}} className="w-full mt-8 py-4">
              {t('proceed')}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
