'use client';

import { useEffect } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errorPage');
  useEffect(() => {
    // Error logged by error boundary
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('subtitle')}</h2>
          <p className="text-gray-600">{t('description')}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                {t('details')}
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PrimaryButton onClick={reset} className="px-6 py-3">
            {t('retry')}
          </PrimaryButton>
          <PrimaryButton
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700"
          >
            {t('backHome')}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
