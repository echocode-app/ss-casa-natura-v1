'use client';

import { useTranslations } from 'next-intl';
import Spinner from '@/components/ui/Spinner/Spinner';
import {
  cartPromoErrorTranslationKey,
  normalizeCartPromoErrorCode,
} from '@/lib/utils/cartPromoMessages';

type Props = {
  isAuthenticated: boolean;
  isDisabled: boolean;
  isApplyingPromo: boolean;
  showPromoSpinner: boolean;
  promoCode?: string;
  promoDiscount?: number;
  error: string | null;

  promoEmail: string;
  setPromoEmail: (next: string) => void;
  promoEmailError: string;
  setPromoEmailError: (next: string) => void;

  promoInput: string;
  setPromoInput: (next: string) => void;

  isValidEmail: (email: string) => boolean;
  onApplyPromo: () => Promise<void>;
  onRemovePromo: () => Promise<void>;
};

export function PromoCodeSection({
  isAuthenticated,
  isDisabled,
  isApplyingPromo,
  showPromoSpinner,
  promoCode,
  promoDiscount,
  error,
  promoEmail,
  setPromoEmail,
  promoEmailError,
  setPromoEmailError,
  promoInput,
  setPromoInput,
  isValidEmail,
  onApplyPromo,
  onRemovePromo,
}: Props) {
  const t = useTranslations('user.cart');
  const tProfile = useTranslations('user.account.profile');

  const promoErrorMessage =
    error && error.includes('promo')
      ? t(
          cartPromoErrorTranslationKey(
            normalizeCartPromoErrorCode(error.replace(/^promo:\s*/i, '')),
          ),
          { defaultValue: t('discountError') },
        )
      : null;

  if (promoCode) {
    return (
      <div className="flex items-center justify-between pl-2 border border-dashed rounded-input-xl">
        <div className="flex flex-col py-2">
          <span className="text-sm text-text-muted">{t('promoApplied')}</span>
          <span className="font-medium text-green-700">{promoCode}</span>
        </div>

        <div className="flex items-center gap-3 m-1 md:my-2 md:mx-2">
          {!!promoDiscount && promoDiscount > 0 && (
            <span className="font-semibold text-green-700">-€ {promoDiscount.toFixed(2)}</span>
          )}
          <button
            type="button"
            onClick={onRemovePromo}
            disabled={isDisabled || isApplyingPromo}
            className={`
              text-sm font-semibold underline
              ${isDisabled || isApplyingPromo ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}
            `}
          >
            {showPromoSpinner ? <Spinner size="sm" colorScheme="muted" /> : t('remove')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!isAuthenticated && (
        <div>
          <div
            className={`
              flex items-center justify-between pl-2
              border border-dashed rounded-input-xl
              ${isDisabled ? 'opacity-60' : ''}
            `}
          >
            <input
              type="email"
              placeholder={tProfile('email')}
              value={promoEmail}
              disabled={isDisabled}
              onChange={(e) => {
                setPromoEmail(e.target.value);
                setPromoEmailError('');
              }}
              className="flex-1 border-none outline-none bg-transparent text-[clamp(12px,3vw,18px)]"
            />
          </div>

          {promoEmailError && (
            <p className="mt-1 px-2 text-[clamp(10px,3vw,14px)] text-red-500">{promoEmailError}</p>
          )}
        </div>
      )}

      <div
        className={`
          mt-5
          flex items-center justify-between pl-2 lg:pl-6
          border border-dashed rounded-input-xl
          ${isDisabled ? 'opacity-60' : ''}
        `}
      >
        <input
          type="text"
          value={promoInput}
          onChange={(e) => setPromoInput(e.target.value)}
          placeholder={t('promoCode')}
          disabled={isDisabled}
          className="flex-1 border-none outline-none bg-transparent text-[clamp(12px,3vw,18px)]"
          onKeyDown={(e) => e.key === 'Enter' && onApplyPromo()}
        />

        <div className="m-1">
          <button
            type="button"
            onClick={onApplyPromo}
            disabled={
              isDisabled ||
              isApplyingPromo ||
              !promoInput.trim() ||
              (!isAuthenticated && !isValidEmail(promoEmail.trim()))
            }
            className={`
              bg-background-green text-black
              min-w-[60px] lg:min-w-[100px]
              px-2 py-3 lg:px-5
              rounded-button-sm
              font-semibold
              transition-opacity duration-300
              ${
                isDisabled ||
                isApplyingPromo ||
                !promoInput.trim() ||
                (!isAuthenticated && !isValidEmail(promoEmail.trim()))
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:opacity-90'
              }
            `}
          >
            {showPromoSpinner ? <Spinner size="sm" colorScheme="muted" /> : t('apply')}
          </button>
        </div>
      </div>

      {/* promo error under promo input (requested) */}
      {!!promoErrorMessage && (
        <p className="mt-2 px-2 text-[clamp(10px,3vw,14px)] text-red-500" role="alert">
          {promoErrorMessage}
        </p>
      )}
    </div>
  );
}
