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
  integrations?: Record<string, { ok: boolean; url: string }>;
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Dashboard</h1>
          <p className="text-gray-600">Panoramica settimanale e mensile</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminCard className="p-5">
          <div className="text-sm text-gray-600">Utenti registrati</div>
          <div className="mt-2 text-3xl font-semibold">
            {loading ? '—' : (widgets?.users?.total ?? '—')}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Settimana: {loading ? '—' : (widgets?.users?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.users?.month ?? '—')}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="text-sm text-gray-600">Richieste promo (newsletter)</div>
          <div className="mt-2 text-3xl font-semibold">
            {loading ? '—' : (widgets?.promoRequests?.total ?? '—')}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Settimana: {loading ? '—' : (widgets?.promoRequests?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.promoRequests?.month ?? '—')}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="text-sm text-gray-600">Ordini creati</div>
          <div className="mt-2 text-3xl font-semibold">
            {loading ? '—' : (widgets?.orders?.total ?? '—')}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Settimana: {loading ? '—' : (widgets?.orders?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.orders?.month ?? '—')}
          </div>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard className="p-5">
          <div className="font-semibold">Top prodotti (ultimi 30 giorni)</div>
          <div className="mt-4 space-y-2">
            {(data?.topSelling || []).length ? (
              data?.topSelling?.map((p) => (
                <div key={p.productId} className="flex items-center justify-between text-sm">
                  <div className="text-gray-800 truncate pr-3">{p.title || p.productId}</div>
                  <div className="font-semibold">{p.quantity}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">Nessun dato disponibile.</div>
            )}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="font-semibold">Scorte basse</div>
          <div className="mt-4 space-y-2">
            {(data?.lowStock || []).length ? (
              data?.lowStock?.map((p) => (
                <div key={p.productId} className="flex items-center justify-between text-sm">
                  <div className="text-gray-800 truncate pr-3">{p.title || p.productId}</div>
                  <div className="font-semibold">{p.stock ?? '—'}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">Nessun dato disponibile.</div>
            )}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Stato integrazioni</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.integrations ? (
            Object.entries(data.integrations).map(([key, val]) => (
              <a
                key={key}
                href={val.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-[18px] border border-black/5 bg-white/70 px-4 py-3 hover:shadow-header transition"
              >
                <div className="text-sm text-gray-600">{key}</div>
                <div
                  className={`mt-1 font-semibold ${val.ok ? 'text-green-700' : 'text-gray-600'}`}
                >
                  {val.ok ? 'OK' : 'Non configurato'}
                </div>
              </a>
            ))
          ) : (
            <div className="text-sm text-gray-600">Nessun dato disponibile.</div>
          )}
        </div>
      </AdminCard>
    </div>
  );
}
