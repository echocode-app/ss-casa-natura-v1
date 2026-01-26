'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error logged by error boundary
  }, [error]);

  return (
    <html lang="it">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
          <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">😔</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Errore critico</h2>
              <p className="text-gray-600 mb-4">
                Si è verificato un errore critico dell'applicazione.
              </p>
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Dettagli errore (dev only)
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
                Riprova
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors"
              >
                Vai alla home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
