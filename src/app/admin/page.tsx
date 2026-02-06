'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/layout/AuthContext';
import AdminCard from '@/components/admin/AdminCard';
import Link from 'next/link';
import { canAccessAdminSection } from '@/lib/admin/access';
import notify from '@/lib/notify';

type StatsResponse = {
  success?: boolean;
  widgets?: {
    users?: { total: number; week: number; month: number };
    promoRequests?: { total: number; week: number; month: number };
    orders?: { total: number; week: number; month: number; pending?: number };
    contactRequests?: { total: number; new?: number };
  };
  promoEmails?: Array<{ email: string; createdAt?: string }>;
  topSelling?: Array<{ productId: string; title?: string; quantity: number }>;
  lowStock?: Array<{
    productId: string;
    title?: string;
    sku?: string;
    stock?: number;
    variantLabel?: string;
    variantId?: string;
  }>;
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
  const canOrders = canAccessAdminSection(user?.role, 'orders', user?.adminSections);
  const canProducts = canAccessAdminSection(user?.role, 'products', user?.adminSections);

  const warnRestricted = (label: string) => {
    notify.error(`Accesso non consentito: ${label}.`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AdminCard className="p-6">
          <div className="text-sm text-gray-600 leading-relaxed mb-3">Utenti registrati</div>
          <div className="text-3xl font-semibold leading-tight">
            {loading ? '—' : (widgets?.users?.total ?? '—')}
          </div>
          <div className="mt-3 text-sm text-gray-600 leading-relaxed">
            Settimana: {loading ? '—' : (widgets?.users?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.users?.month ?? '—')}
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            Mostra il totale utenti registrati e nuovi utenti negli ultimi 7/30 giorni. Se il DB è
            offline, i valori restano vuoti.
          </p>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="text-sm text-gray-600 leading-relaxed mb-3">
            {canOrders ? (
              <Link href="/admin/orders" className="text-blue-700 hover:underline">
                Ordini creati
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => warnRestricted('Ordini')}
                className="text-blue-700 underline-offset-2 hover:underline"
              >
                Ordini creati
              </button>
            )}
          </div>
          <div className="text-3xl font-semibold leading-tight">
            {loading ? '—' : (widgets?.orders?.total ?? '—')}
          </div>
          <div className="mt-2 text-sm text-gray-600 leading-relaxed">
            Nuovi non lavorati: {loading ? '—' : (widgets?.orders?.pending ?? '—')}
          </div>
          <div className="mt-3 text-sm text-gray-600 leading-relaxed">
            Settimana: {loading ? '—' : (widgets?.orders?.week ?? '—')} · Mese:{' '}
            {loading ? '—' : (widgets?.orders?.month ?? '—')}
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            Conteggio totale ordini + nuovi non lavorati (pending). I valori settimanali/mensili
            sono basati sugli ordini pagati.
          </p>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="text-sm text-gray-600 leading-relaxed mb-3">
            <Link href="/admin/submissions" className="text-blue-700 hover:underline">
              Richieste contatto
            </Link>
          </div>
          <div className="text-3xl font-semibold leading-tight">
            {loading ? '—' : (widgets?.contactRequests?.total ?? '—')}
          </div>
          <div className="mt-2 text-sm text-gray-600 leading-relaxed">
            Nuove non gestite: {loading ? '—' : (widgets?.contactRequests?.new ?? '—')}
          </div>
          <p className="mt-3 text-xs text-gray-500 leading-relaxed">
            Totale richieste dal form contatti e numero di nuove richieste da gestire.
          </p>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AdminCard className="p-6">
          <div className="font-semibold text-base leading-tight mb-5">
            Top prodotti (ultimi 30 giorni)
          </div>
          <div className="space-y-3">
            {(data?.topSelling || []).length ? (
              data?.topSelling?.map((p) =>
                canProducts ? (
                  <Link
                    key={p.productId}
                    href={`/admin/products/${p.productId}`}
                    className="flex items-center justify-between text-sm leading-relaxed hover:underline"
                  >
                    <div className="text-gray-800 truncate pr-3">{p.title || p.productId}</div>
                    <div className="font-semibold">{p.quantity}</div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    key={p.productId}
                    onClick={() => warnRestricted('Prodotti')}
                    className="flex w-full items-center justify-between text-sm leading-relaxed text-left hover:underline"
                  >
                    <div className="text-gray-800 truncate pr-3">{p.title || p.productId}</div>
                    <div className="font-semibold">{p.quantity}</div>
                  </button>
                ),
              )
            ) : (
              <div className="text-sm text-gray-600 leading-relaxed">Nessun dato disponibile.</div>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Basato sugli ordini pagati degli ultimi 30 giorni. Se non ci sono ordini, la lista è
            vuota.
          </p>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="font-semibold text-base leading-tight mb-5">Scorte basse</div>
          <div className="space-y-3">
            {(data?.lowStock || []).length ? (
              data?.lowStock?.map((p, idx) =>
                canProducts ? (
                  <Link
                    key={`${p.productId}-${idx}`}
                    href={`/admin/products/${p.productId}`}
                    className="flex items-center justify-between text-sm leading-relaxed hover:underline"
                  >
                    <div className="text-gray-800 truncate pr-3">
                      {p.title || p.productId}
                      {(p.variantLabel || p.variantId) && (
                        <span className="text-gray-500 ml-1">
                          ({p.variantLabel || p.variantId})
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-red-600">{p.stock ?? '—'}</div>
                  </Link>
                ) : (
                  <button
                    type="button"
                    key={`${p.productId}-${idx}`}
                    onClick={() => warnRestricted('Prodotti')}
                    className="flex w-full items-center justify-between text-sm leading-relaxed text-left hover:underline"
                  >
                    <div className="text-gray-800 truncate pr-3">
                      {p.title || p.productId}
                      {(p.variantLabel || p.variantId) && (
                        <span className="text-gray-500 ml-1">
                          ({p.variantLabel || p.variantId})
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-red-600">{p.stock ?? '—'}</div>
                  </button>
                ),
              )
            ) : (
              <div className="text-sm text-gray-600 leading-relaxed">Nessun dato disponibile.</div>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Mostra varianti/prodotti disponibili con stock ≤ 5. Se lo stock non è impostato, non
            viene segnalato.
          </p>
        </AdminCard>
      </div>

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
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          Richieste newsletter raccolte. Errori di rete o DB possono azzerare la risposta.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-blue-700 hover:underline">
            Mostra email iscritti
          </summary>
          <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-black/5 bg-white/70 p-3 text-sm text-gray-700">
            {(data?.promoEmails || []).length ? (
              <ul className="space-y-1">
                {data?.promoEmails?.map((e, idx) => (
                  <li key={`${e.email}-${idx}`} className="flex justify-between gap-3">
                    <span className="truncate">{e.email}</span>
                    {e.createdAt ? (
                      <span className="text-xs text-gray-500">
                        {new Date(e.createdAt).toLocaleDateString('it-IT')}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">Nessuna email trovata.</div>
            )}
          </div>
        </details>
      </AdminCard>

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
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          Stato configurazioni servizi. “Non configurato” indica variabili d’ambiente mancanti.
        </p>
      </AdminCard>
    </div>
  );
}
