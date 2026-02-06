'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import {
  cartPromoErrorTranslationKey,
  normalizeCartPromoErrorCode,
} from '@/lib/utils/cartPromoMessages';

export default function CartFooter({ items = [], onProceed }) {
  const t = useTranslations('user.cart');
  const router = useRouter();
  const {
    getItemCount,
    getSubtotal,
    getTotal,
    promoCode,
    promoDiscount,
    isLoading,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState(null); // 'success' | 'error' | null
  const [discountMessageKey, setDiscountMessageKey] = useState(null);

  const totalQuantity = useMemo(() => getItemCount(), [getItemCount, items]);
  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);
  const total = useMemo(() => getTotal(), [getTotal, items]);

  const hasPromo = !!promoCode && (promoDiscount || 0) > 0;
  const isDisabled = items.length === 0 || isLoading;

  const handleApplyDiscount = async () => {
    const code = discountCode.trim();
    if (!code) {
      setDiscountStatus('error');
      return;
    }

    try {
      await applyPromoCode(code);
      setDiscountCode('');
      setDiscountMessageKey(null);
      setDiscountStatus('success');
    } catch (err) {
      const code = err?.errorCode || err?.message;
      const normalized = normalizeCartPromoErrorCode(code);
      setDiscountMessageKey(cartPromoErrorTranslationKey(normalized));
      setDiscountStatus('error');
    }
  };

  const handleRemoveDiscount = async () => {
    try {
      await removePromoCode();
      setDiscountMessageKey(null);
      setDiscountStatus(null);
    } catch {
      setDiscountStatus('error');
    }
  };

  const handleProceed = () => {
    onProceed?.();
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-2 lg:gap-0 pt-2 lg:pt-4 pb-3 lg:pb-8">
      <div className="flex justify-between px-2 md:px-6 xl:px-10">
        <span>
          {totalQuantity} {t('items')}
        </span>
        <span className="font-semibold text-text-extrablack">€ {subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between gap-2 mt-2 lg:mt-4 px-2 md:px-6 xl:px-10 text-text-muted">
        <span>{t('shipping')}</span>
        <span className="font-semibold text-right">{t('calculated')}</span>
      </div>

      {/* Promo / Discount */}
      <div className="px-2 md:px-5 mt-3 lg:mt-6">
        {hasPromo ? (
          <div className="flex items-center justify-between pl-2 lg:pl-6 border border-dashed rounded-input-xl">
            <div className="flex flex-col py-2">
              <span className="text-sm text-text-muted">{t('promoApplied')}</span>
              <span className="font-medium text-green-700">{promoCode}</span>
            </div>

            <div className="flex items-center gap-3 m-1 md:my-2 md:mx-2">
              <span className="font-semibold text-green-700">-€ {promoDiscount.toFixed(2)}</span>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                disabled={isDisabled}
                className={`
                  text-sm font-semibold underline
                  ${isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}
                `}
              >
                {t('remove')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`
                flex items-center justify-between pl-2 lg:pl-6
                border border-dashed rounded-input-xl
                ${isDisabled ? 'opacity-60' : ''}
              `}
            >
              <input
                type="text"
                placeholder={t('discount')}
                value={discountCode}
                disabled={isDisabled}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  setDiscountStatus(null);
                }}
                className="flex-1 border-none outline-none bg-transparent text-[clamp(12px,3vw,18px)]"
              />

              <div className="m-1 md:my-2 md:mx-2">
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={isDisabled}
                  className={`
                    bg-background-green text-black
                    min-w-[60px] lg:min-w-[165px]
                    px-3 py-2 lg:px-5 lg:py-3
                    rounded-button-sm
                    font-semibold
                    transition-opacity duration-300
                    ${isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90'}
                  `}
                >
                  {t('apply')}
                </button>
              </div>
            </div>

            {discountStatus && (
              <p
                className={`
                  mt-2 px-2 text-[clamp(10px,3vw,14px)]
                  ${discountStatus === 'success' ? 'text-lime-500' : 'text-red-500'}
                `}
              >
                {discountStatus === 'success' ? t('discountSuccess') : t('discountError')}
              </p>
            )}

            {discountStatus === 'error' && discountMessageKey && (
              <p className="mt-2 px-2 text-[clamp(10px,3vw,14px)] text-red-500">
                {t(discountMessageKey, { defaultValue: t('discountError') })}
              </p>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 lg:mt-8 px-2 md:px-6 xl:px-10">
        <div className="flex gap-2 items-baseline">
          <span className="font-semibold">{t('total')}</span>
          <span className="text-sm">{t('taxIncluded')}</span>
        </div>

        <span className="font-semibold text-text-extrablack">€ {total.toFixed(2)}</span>
      </div>

      <div className="flex justify-end mt-3 lg:mt-6 px-2 lg:px-5 xl:px-8 pb-2">
        <PrimaryButton
          onClick={handleProceed}
          disabled={items.length === 0 || isLoading}
          className="w-[180px] lg:w-[220px] py-3 px-5 lg:py-4 lg:px-6"
        >
          {t('proceed')}
        </PrimaryButton>
      </div>
    </div>
  );
}
