'use client';

import { useEffect, useMemo, useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState('it');

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const docLang = document.documentElement.lang || '';
    const navLang = typeof navigator !== 'undefined' ? navigator.language : '';
    const nextLocale = (docLang || navLang || 'it').toLowerCase().startsWith('en') ? 'en' : 'it';
    setLocale(nextLocale);
  }, []);

  const copy = useMemo(
    () => ({
      it: {
        title: 'Errore critico',
        description: "Si è verificato un errore critico dell'applicazione.",
        details: 'Dettagli errore (dev only)',
        retry: 'Riprova',
        backHome: 'Vai alla home',
      },
      en: {
        title: 'Critical error',
        description: 'A critical application error has occurred.',
        details: 'Error details (dev only)',
        retry: 'Try again',
        backHome: 'Go to home',
      },
    }),
    [],
  );

  const t = copy[locale as 'it' | 'en'] || copy.it;

  useEffect(() => {
    // Error logged by error boundary
  }, [error]);

  return (
    <html lang={locale}>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">😔</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t.title}</h2>
              <p className="text-gray-600 mb-4">{t.description}</p>
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    {t.details}
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors"
              >
                {t.retry}
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors"
              >
                {t.backHome}
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
