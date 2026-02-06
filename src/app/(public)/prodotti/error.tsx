'use client';

import { useEffect } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { useTranslations } from 'next-intl';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('prodotti.error');
  useEffect(() => {
    // Error logged by error boundary
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-600 text-lg mb-6">{t('description')}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
              <summary className="cursor-pointer text-sm text-gray-700 font-medium hover:text-gray-900">
                {t('details')}
              </summary>
              <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-48 border border-gray-200">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrimaryButton onClick={reset} className="px-8 py-4 text-lg">
            {t('retry')}
          </PrimaryButton>
          <PrimaryButton
            onClick={() => (window.location.href = '/')}
            className="px-8 py-4 text-lg bg-gray-600 hover:bg-gray-700"
          >
            {t('backHome')}
          </PrimaryButton>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          {t('contactPrompt')}{' '}
          <a href="/contatti" className="text-green-600 hover:text-green-700 underline">
            {t('contactLink')}
          </a>
        </div>
      </div>
    </div>
  );
}
