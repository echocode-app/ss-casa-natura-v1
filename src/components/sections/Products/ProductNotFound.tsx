'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function ProductNotFound() {
  const t = useTranslations('prodotti');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4">
          {t('notFoundTitle')}
        </h1>

        <p className="text-lg text-text-soft mb-3">{t('notFoundDescription')}</p>

        <p className="text-base text-text-soft mb-8">{t('notFoundSuggestion')}</p>

        <Link href="/prodotti" className="inline-block">
          <PrimaryButton onClick={() => {}} className="min-w-[200px] py-4 text-lg">
            {t('backToCatalog')}
          </PrimaryButton>
        </Link>
      </div>
    </div>
  );
}
