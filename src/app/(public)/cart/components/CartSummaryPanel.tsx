'use client';

import { useTranslations } from 'next-intl';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { PromoCodeSection } from './PromoCodeSection';

type Props = {
  totalQuantity: number;
  subtotal: number;
  total: number;
  isDisabled: boolean;

  promoCode?: string;
  promoDiscount?: number;
  error: string | null;

  promoInput: string;
  setPromoInput: (next: string) => void;

  isApplyingPromo: boolean;
  showPromoSpinner: boolean;
  onApplyPromo: () => Promise<void>;
  onRemovePromo: () => Promise<void>;

  onProceedToCheckout: () => void;
  isProceedDisabled: boolean;
};

export function CartSummaryPanel({
  totalQuantity,
  subtotal,
  total,
  isDisabled,
  promoCode,
  promoDiscount,
  error,
  promoInput,
  setPromoInput,
  isApplyingPromo,
  showPromoSpinner,
  onApplyPromo,
  onRemovePromo,
  onProceedToCheckout,
  isProceedDisabled,
}: Props) {
  const t = useTranslations('user.cart');

  return (
    <div className="w-full md:max-w-[45%] xl:max-w-[40%]">
      <div className="bg-background-secondary rounded-[20px] p-4">
        <h2 className="font-semibold text-2xl mb-4 md:mb-6">{t('summary')}</h2>

        <div className="space-y-5">
          <div className="flex justify-between">
            <span>
              {totalQuantity} {t('items')}
            </span>
            <span className="font-semibold">€ {subtotal.toFixed(2)}</span>
          </div>

          <div className="space-y-5">
            <PromoCodeSection
              isDisabled={isDisabled}
              isApplyingPromo={isApplyingPromo}
              showPromoSpinner={showPromoSpinner}
              promoCode={promoCode}
              promoDiscount={promoDiscount}
              error={error}
              promoInput={promoInput}
              setPromoInput={setPromoInput}
              onApplyPromo={onApplyPromo}
              onRemovePromo={onRemovePromo}
            />
          </div>

          <div className="flex justify-between text-[clamp(10px,3vw,14px)] text-text-muted gap-3 pt-4">
            <span>{t('shipping')}</span>
            <span className="font-semibold">{t('calculated')}</span>
          </div>

          <div className="pt-4 lg:pt-8">
            <div className="flex justify-between">
              <div className="flex gap-2 items-end">
                <span className="font-semibold text-[clamp(14px,3vw,20px)]">{t('total')}</span>
                <p className="text-[clamp(10px,3vw,14px)] text-text-muted">{t('taxIncluded')}</p>
              </div>
              <span className="font-semibold text-[clamp(18px,3vw,22px)]">
                € {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <PrimaryButton
            onClick={onProceedToCheckout}
            disabled={isProceedDisabled}
            className="min-w-[260px] md:w-full mt-8 py-5 px-6 md:px-3"
          >
            {t('proceed')}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
