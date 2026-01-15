'use client';

import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import CartEmpty from '@/components/ui/Сart/CartEmpty';
import SimpleBreadcrumbs from '@/components/ui/Breadcrumbs/SimpleBreadcrumbs';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useEffect, useState } from 'react';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';
import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { CartItemsPanel } from './components/CartItemsPanel';
import { CartSummaryPanel } from './components/CartSummaryPanel';

export function CartPageClient() {
  const t = useTranslations('user.cart');
  const tValidation = useTranslations('validation');
  const tHeaderActions = useTranslations('header.actions');
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

  const isDisabled = items.length === 0 || isLoading;

  useEffect(() => {
    setPromoEmail(user?.email || '');
  }, [user]);

  const isValidEmail = (email: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const totalQuantity = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();

  const withItemPending = async <T,>(itemId: string, action: () => Promise<T>) => {
    setActiveItemId(itemId);
    try {
      return await action();
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

  const handleSetQuantity = async (itemId: string, quantity: number) => {
    return await withItemPending(itemId, () => updateItem(itemId, quantity));
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
      </div>
    );
  }

  return (
    <section className="py-6 xl:py-10 overflow-hidden">
      <SimpleBreadcrumbs
        className="py-0"
        items={[{ label: tHeaderActions('home'), href: '/' }, { label: t('title') }]}
      />
      <div className="mx-auto md:max-w-[1570px] px-4 md:px-6 lg:px-12">
        {showActionSpinner && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
            <Spinner size="lg" />
          </div>
        )}

        <h1 className="font-semibold text-[clamp(30px,5vw,47px)] leading-[clamp(30px,5vw,50px)] text-center mb-8 md:mb-16">
          {t('title')}
        </h1>

        <div
          className="mx-auto md:mx-0 items-center
        flex flex-col md:flex-row gap-3 lg:gap-6 md:items-start justify-center"
        >
          {/* 📌 Cart Items */}
          <CartItemsPanel
            items={items}
            activeItemId={activeItemId}
            showActionSpinner={showActionSpinner}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onSetQuantity={handleSetQuantity}
            onRemove={handleRemove}
            onClearCart={handleClearCart}
          />

          {/* 📌 Cart Summary */}
          <CartSummaryPanel
            totalQuantity={totalQuantity}
            subtotal={subtotal}
            total={total}
            isAuthenticated={isAuthenticated}
            isDisabled={isDisabled}
            promoCode={promoCode}
            promoDiscount={promoDiscount}
            error={error}
            promoEmail={promoEmail}
            setPromoEmail={setPromoEmail}
            promoEmailError={promoEmailError}
            setPromoEmailError={setPromoEmailError}
            promoInput={promoInput}
            setPromoInput={setPromoInput}
            isApplyingPromo={isApplyingPromo}
            showPromoSpinner={showPromoSpinner}
            isValidEmail={isValidEmail}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            onProceedToCheckout={handleProceedToCheckout}
            isProceedDisabled={items.length === 0 || showActionSpinner}
          />
        </div>
      </div>
    </section>
  );
}
