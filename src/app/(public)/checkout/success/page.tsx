'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout');
  const params = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-8 lg:px-10 py-12">
      <h1 className="heading-default heading-sm lg:heading-lg mb-4">{t('success.title')}</h1>
      <p className="text-text-muted mb-6">{t('success.description')}</p>
      {orderId && <p className="text-sm text-text-muted mb-8">{t('success.order', { orderId })}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/account">
          <PrimaryButton onClick={() => {}} className="px-8 py-4">
            {t('success.toAccount')}
          </PrimaryButton>
        </Link>
        <Link href="/prodotti" className="text-brand-dark hover:underline self-center">
          {t('success.toCatalog')}
        </Link>
      </div>
    </div>
  );
}
