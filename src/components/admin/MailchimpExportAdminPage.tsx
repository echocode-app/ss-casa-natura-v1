'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import Spinner from '@/components/ui/Spinner/Spinner';
import MailchimpExportPanel from './MailchimpExportPanel';

/**
 * MailchimpExportAdminPage Component
 *
 * Production-ready admin page for Mailchimp export management.
 *
 * Features:
 * - Role-based access control (developer, superadmin, admin)
 * - Protected route with access denial message
 * - Fetches and displays statistics from /api/mailchimp/stats
 * - Loading states and error handling
 * - Integration with MailchimpExportPanel component
 *
 * Permissions:
 * - developer: Full access (development environment)
 * - superadmin: Full access (production admin)
 * - admin: View/export only, no API subscription management
 *
 * Route: /admin/mailchimp
 */

// Allowed roles for accessing the Mailchimp export admin panel
const ALLOWED_ROLES = ['developer', 'superadmin', 'admin'];

interface StatsData {
  totalCount: number;
  recentEmails: Array<{
    email: string;
    source: string;
    createdAt: string;
  }>;
  bySource: Array<{
    source: string;
    count: number;
  }>;
}

export default function MailchimpExportAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      if (!user.role || !ALLOWED_ROLES.includes(user.role)) {
        setPageError('Accesso negato: non hai il permesso di accedere a questa pagina.');
      }
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (user && user.role && ALLOWED_ROLES.includes(user.role)) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);

    try {
      const response = await fetch('/api/mailchimp/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Errore durante il caricamento delle statistiche: ${response.statusText}`);
      }

      const data: StatsData = await response.json();
      setStats(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setStatsError(errorMessage);
    } finally {
      setStatsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spinner size="lg" colorScheme="accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Autenticazione Richiesta</h1>
            <p className="text-red-600">
              Devi essere autenticato per accedere al pannello di amministrazione dell'esportazione
              Mailchimp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-700 mb-4">Accesso Negato</h1>
            <p className="text-red-600 mb-4">{pageError}</p>
            <p className="text-sm text-red-500">
              Il tuo ruolo: <span className="font-semibold">{user.role}</span>
            </p>
            <p className="text-sm text-red-500 mt-2">
              Ruoli richiesti: <span className="font-semibold">{ALLOWED_ROLES.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Amministrazione Esportazione Mailchimp
              </h1>
              <p className="text-gray-600 mt-2">
                Gestisci ed esporta email di marketing per l'audience Mailchimp
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Accesso come: <span className="font-semibold text-gray-900">{user.email}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ruolo: <span className="font-semibold text-gray-700">{user.role}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Statistiche Database</h2>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {statsLoading ? (
                <>
                  <Spinner size="sm" colorScheme="accent" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Aggiorna Statistiche
                </>
              )}
            </button>
          </div>

          {statsError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                <span className="font-semibold">Errore nel caricamento delle statistiche:</span>{' '}
                {statsError}
              </p>
            </div>
          )}

          {statsLoading && !stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Total Emails */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <p className="text-gray-600 text-sm font-medium mb-2">Email Totali</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCount}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Email nel database pronti per l'esportazione
                  </p>
                </div>

                {/* Email Recenti */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <p className="text-gray-600 text-sm font-medium mb-2">Email Recenti (24h)</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.recentEmails.length}</p>
                  <p className="text-xs text-gray-500 mt-2">Ultimi email aggiunti da varie fonti</p>
                </div>

                {/* Stato Esportazione */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <p className="text-gray-600 text-sm font-medium mb-2">Stato Esportazione</p>
                  <p className="text-3xl font-bold text-green-600">Pronto</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Clicca su "Esporta su Mailchimp" per iniziare
                  </p>
                </div>
              </div>

              {stats.bySource.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email per Fonte</h3>
                  <div className="space-y-3">
                    {stats.bySource.map((source) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">
                          {source.source.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-gray-900">{source.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats.recentEmails.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Recenti</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {stats.recentEmails.slice(0, 10).map((email, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-gray-700 truncate">{email.email}</span>
                        <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                          {email.source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Mailchimp Export Panel */}
        {user && user.role && ALLOWED_ROLES.includes(user.role) && (
          <div className="mt-12">
            <MailchimpExportPanel />
          </div>
        )}
      </div>

      <div className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-600">
            Documentazione: <span className="font-semibold">docs/MAILCHIMP_EXPORT_GUIDE.md</span>
          </p>
        </div>
      </div>
    </div>
  );
}
