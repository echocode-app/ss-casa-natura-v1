'use client';

import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function CartFooter({ items = [] }) {
  const t = useTranslations('user.cart');

  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState(null);
  // null | 'success' | 'error'

  const totalQuantity = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);

  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.price * i.quantity, 0), [items]);

  const total = discountStatus === 'success' ? subtotal * 0.9 : subtotal;

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;

    // 🔧
    if (discountCode.toLowerCase() === '10') {
      setDiscountStatus('success');
    } else {
      setDiscountStatus('error');
    }
  };

  const isDisabled = discountStatus === 'success';

  return (
    <div className="flex flex-col gap-2 lg:gap-0 pt-2 lg:pt-4 pb-3 lg:pb-8">
      {/* subtotal */}
      <div className="flex justify-between px-2 md:px-6 xl:px-10">
        <span>
          {totalQuantity} {t('items')}
        </span>
        <span className="font-semibold text-text-extrablack">€ {subtotal.toFixed(2)}</span>
      </div>

      {/* shipping */}
      <div className="flex justify-between gap-2 mt-2 lg:mt-4 px-2 md:px-6 xl:px-10 text-text-muted">
        <span>{t('shipping')}</span>
        <span className="font-semibold text-right">{t('calculated')}</span>
      </div>

      {/* discount */}
      <div className="px-2 md:px-5 mt-3 lg:mt-6">
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

        {/* feedback */}
        {discountStatus && (
          <p
            className={`
              mt-2 px-4 text-[clamp(10px,3vw,14px)]
              ${discountStatus === 'success' ? 'text-lime-500' : 'text-red-500'}
            `}
          >
            {discountStatus === 'success' ? t('discountSuccess') : t('discountError')}
          </p>
        )}
      </div>

      {/* total */}
      <div className="flex justify-between items-center mt-3 lg:mt-8 px-2 md:px-6 xl:px-10">
        <div className="flex gap-2 items-baseline">
          <span className="font-semibold">{t('total')}</span>
          <span className="text-sm">{t('taxIncluded')}</span>
        </div>

        <span className="font-semibold text-text-extrablack">€ {total.toFixed(2)}</span>
      </div>

      {/* proceed */}
      <div className="flex justify-end mt-3 lg:mt-6 px-2 lg:px-5 xl:px-8 pb-2">
        <PrimaryButton className="w-[180px] lg:w-[220px] py-3 px-5 lg:py-4 lg:px-6">
          {t('proceed')}
        </PrimaryButton>
      </div>
    </div>
  );
}
