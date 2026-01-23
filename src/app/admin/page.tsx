'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import AdminCard from '@/components/admin/AdminCard';

type StatsResponse = {
  success?: boolean;
  widgets?: {
    users?: { total: number; week: number; month: number };
    promoRequests?: { total: number; week: number; month: number };
    orders?: { total: number; week: number; month: number };
  };
  topSelling?: Array<{ productId: string; title?: string; quantity: number }>;
  lowStock?: Array<{ productId: string; title?: string; sku?: string; stock?: number }>;
  integrations?: Record<string, { ok: boolean; url: string; details?: string; info?: string }>;
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        setData(json);
      })
      .catch(() => {
        if (!mounted) return;
        setData(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const widgets = data?.widgets;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)] leading-tight mb-3">
            Dashboard
          </h1>
          <p className="text-gray-600 leading-relaxed">Panoramica settimanale e mensile</p>
        </div>
        <div className="text-sm text-gray-700">
          <div>
            Utente: <span className="font-semibold">{user?.email}</span>
          </div>
          <div>
            Ruolo: <span className="font-semibold">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AdminCard className="p-6">
          <div className="text-sm text-gray-600 leading-relaxed mb-3">Utenti registrati</div>
          <div className="text-3xl font-semibold leading-tight">
            {loading ? '—' : (widgets?.users?.total ?? '—')}
          </div>
          <div className="mt-3 text-sm text-gray-600 leading-relaxed">
            Settimana: {loading ? '—' : (widgets?.users?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.users?.month ?? '—')}
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="text-sm text-gray-600 leading-relaxed mb-3">
            Richieste promo (newsletter)
          </div>
          <div className="text-3xl font-semibold leading-tight">
            {loading ? '—' : (widgets?.promoRequests?.total ?? '—')}
          </div>
          <div className="mt-3 text-sm text-gray-600 leading-relaxed">
            Settimana: {loading ? '—' : (widgets?.promoRequests?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.promoRequests?.month ?? '—')}
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="text-sm text-gray-600 leading-relaxed mb-3">Ordini creati</div>
          <div className="text-3xl font-semibold leading-tight">
            {loading ? '—' : (widgets?.orders?.total ?? '—')}
          </div>
          <div className="mt-3 text-sm text-gray-600 leading-relaxed">
            Settimana: {loading ? '—' : (widgets?.orders?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.orders?.month ?? '—')}
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AdminCard className="p-6">
          <div className="font-semibold text-base leading-tight mb-5">
            Top prodotti (ultimi 30 giorni)
          </div>
          <div className="space-y-3">
            {(data?.topSelling || []).length ? (
              data?.topSelling?.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between text-sm leading-relaxed"
                >
                  <div className="text-gray-800 truncate pr-3">{p.title || p.productId}</div>
                  <div className="font-semibold">{p.quantity}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 leading-relaxed">Nessun dato disponibile.</div>
            )}
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="font-semibold text-base leading-tight mb-5">Scorte basse</div>
          <div className="space-y-3">
            {(data?.lowStock || []).length ? (
              data?.lowStock?.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between text-sm leading-relaxed"
                >
                  <div className="text-gray-800 truncate pr-3">{p.title || p.productId}</div>
                  <div className="font-semibold">{p.stock ?? '—'}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600 leading-relaxed">Nessun dato disponibile.</div>
            )}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-6">
        <div className="font-semibold text-base leading-tight mb-5">
          Stato integrazioni API e servizi
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.integrations ? (
            Object.entries(data.integrations).map(([key, val]) => (
              <a
                key={key}
                href={val.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[18px] border border-black/5 bg-white/70 px-4 py-4 hover:shadow-header transition flex flex-col min-h-[130px]"
              >
                <div className="text-sm font-medium text-gray-800 mb-2 leading-snug">{key}</div>
                <div
                  className={`text-xs font-semibold mb-3 leading-relaxed ${val.ok ? 'text-green-700' : 'text-red-600'}`}
                >
                  {val.ok ? '✓ Configurato' : '✗ Non configurato'}
                </div>
                {val.details && (
                  <div
                    className="text-xs text-gray-600 mb-2 truncate leading-relaxed"
                    title={val.details}
                  >
                    {val.details}
                  </div>
                )}
                {val.info && (
                  <div className="text-[11px] text-gray-500 mt-auto leading-snug">{val.info}</div>
                )}
              </a>
            ))
          ) : (
            <div className="text-sm text-gray-600 leading-relaxed">Nessun dato disponibile.</div>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
