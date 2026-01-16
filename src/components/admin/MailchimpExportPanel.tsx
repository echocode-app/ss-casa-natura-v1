'use client';

import { useState } from 'react';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import Spinner from '@/components/ui/Spinner/Spinner';

interface ExportStats {
  totalEmails: number;
  successCount: number;
  errorCount: number;
  errors?: Array<{ email: string; error: string }>;
  message?: string;
}

interface MailchimpStats {
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

/**
 * MailchimpExportPanel Component
 *
 * Production-ready admin panel for exporting marketing emails to Mailchimp
 *
 * Features:
 * - Displays current database statistics
 * - Triggers manual export to Mailchimp
 * - Shows detailed export results with error handling
 * - Supports batch processing (500 emails per batch)
 * - Real-time progress feedback
 *
 * Security:
 * - Requires API_SECRET_KEY in environment
 * - Should be placed in protected admin route
 *
 * Usage:
 * Place in /app/(admin)/mailchimp/page.tsx or similar protected route
 */
export default function MailchimpExportPanel() {
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState<MailchimpStats | null>(null);
  const [exportResult, setExportResult] = useState<ExportStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current marketing email statistics from database
   */
  const fetchStats = async () => {
    setStatsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mailchimp/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Impossibile recuperare le statistiche');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Impossibile caricare le statistiche';
      setError(errorMessage);
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * Trigger Mailchimp export
   *
   * Process:
   * 1. Validates API_SECRET_KEY exists
   * 2. Sends POST request to /api/mailchimp/export
   * 3. API route handles:
   *    - Fetching all emails from MarketingEmails collection
   *    - Email validation (regex)
   *    - Batch processing (500 emails per batch)
   *    - Mailchimp API calls with upsert logic
   *    - Fallback to individual adds if batch fails
   * 4. Displays results with success/error counts
   */
  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setExportResult(null);

    try {
      // Call export API endpoint
      const response = await fetch('/api/mailchimp/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Esportazione fallita');
      }

      setExportResult(data);

      // Refresh stats after successful export
      if (data.success) {
        await fetchStats();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Esportazione fallita. Controlla i log del server.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">Esportazione Email Mailchimp</h1>
        <p className="text-gray-600 mb-6">
          Esporta email di marketing dal database alla lista audience Mailchimp
        </p>

        {/* Sezione Statistiche */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Statistiche Database</h2>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
            >
              {statsLoading ? 'Caricamento...' : 'Aggiorna'}
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Email Totali</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalCount}</div>
              </div>

              {stats.bySource.map((source) => (
                <div key={source.source} className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 capitalize">{source.source}</div>
                  <div className="text-2xl font-bold text-green-600">{source.count}</div>
                </div>
              ))}
            </div>
          )}

          {!stats && !statsLoading && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">
                Clicca su "Carica Statistiche" per visualizzare le statistiche del database
              </p>
              <button onClick={fetchStats} className="text-blue-600 hover:text-blue-800 underline">
                Carica Statistiche
              </button>
            </div>
          )}
        </div>

        {/* Pulsante Esportazione */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Esporta su Mailchimp</h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Prima dell'esportazione</h3>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>
                Assicurati che MAILCHIMP_API_KEY, MAILCHIMP_SERVER_PREFIX e MAILCHIMP_LIST_ID siano
                configurati sul server
              </li>
              <li>L'esportazione elabora tutte le email nel database</li>
              <li>I duplicati vengono gestiti tramite upsert (sicuro da rieseguire)</li>
              <li>Dimensione batch: 500 email per richiesta</li>
            </ul>
          </div>

          <PrimaryButton
            onClick={handleExport}
            disabled={loading || !stats || stats.totalCount === 0}
            className="w-full py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" colorScheme="light" />
                Esportazione su Mailchimp...
              </span>
            ) : (
              `Esporta ${stats?.totalCount || 0} Email su Mailchimp`
            )}
          </PrimaryButton>
        </div>

        {/* Visualizzazione Errore */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-1">Errore</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Risultati Esportazione */}
        {exportResult && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Risultati Esportazione</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Totale</div>
                <div className="text-2xl font-bold">{exportResult.totalEmails}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Successo</div>
                <div className="text-2xl font-bold text-green-600">{exportResult.successCount}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Errori</div>
                <div className="text-2xl font-bold text-red-600">{exportResult.errorCount}</div>
              </div>
            </div>

            {exportResult.message && (
              <div className="p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-700">{exportResult.message}</p>
              </div>
            )}

            {/* Dettagli Errore */}
            {exportResult.errors && exportResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-red-800">
                  Dettagli Errore ({exportResult.errors.length})
                </h4>
                <div className="max-h-60 overflow-y-auto bg-white rounded border border-red-200 p-3">
                  <ul className="space-y-2 text-sm">
                    {exportResult.errors.map((err, idx) => (
                      <li key={idx} className="flex justify-between py-1 border-b last:border-0">
                        <span className="font-mono text-gray-700">{err.email}</span>
                        <span className="text-red-600 text-xs">{err.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anteprima Email Recenti */}
        {stats && stats.recentEmails.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Email Recenti</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <ul className="space-y-2 text-sm">
                {stats.recentEmails.map((email, idx) => (
                  <li key={idx} className="flex justify-between py-2 border-b last:border-0">
                    <span className="font-mono text-gray-700">{email.email}</span>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 capitalize">{email.source}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {new Date(email.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Informazioni Tecniche */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2">ℹ️ Dettagli Tecnici</h3>
        <ul className="space-y-1 text-gray-700">
          <li>
            • <strong>Validazione:</strong> Validazione email tramite regex prima dell'esportazione
          </li>
          <li>
            • <strong>Dimensione Batch:</strong> 500 email per richiesta batch Mailchimp
          </li>
          <li>
            • <strong>Logica Upsert:</strong> Crea nuovi o aggiorna abbonati esistenti
          </li>
          <li>
            • <strong>Fallback:</strong> Aggiunte individuali se il batch fallisce
          </li>
          <li>
            • <strong>Stato:</strong> Tutti gli abbonati impostati su "subscribed"
          </li>
          <li>
            • <strong>Campi Merge:</strong> Include SOURCE e timestamp di registrazione
          </li>
          <li>
            • <strong>Sicuro da Rieseguire:</strong> Le email duplicate vengono gestite tramite hash
            MD5
          </li>
        </ul>
      </div>
    </div>
  );
}
