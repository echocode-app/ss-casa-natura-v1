'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

type OrderRow = {
  _id: string;
  createdAt: string;
  status: 'pending' | 'paid' | 'shipped' | 'canceled';
  customerEmail?: string;
  customerName?: string;
  customerSurname?: string;
  totalPrice?: number;
  promoCode?: string;
  stripePaymentIntentId?: string;
};

type OrdersResponse = {
  success?: boolean;
  orders?: OrderRow[];
  total?: number;
  limit?: number;
  skip?: number;
  error?: string;
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'pending', label: 'In attesa' },
  { value: 'paid', label: 'Pagato' },
  { value: 'shipped', label: 'Spedito' },
  { value: 'canceled', label: 'Annullato' },
];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrdersResponse | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('skip', String(skip));
    if (status) params.set('status', status);
    if (q.trim()) params.set('q', q.trim());
    return params.toString();
  }, [limit, skip, status, q]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/admin/orders?${queryString}`, { credentials: 'include' })
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
  }, [queryString]);

  const total = data?.total ?? 0;
  const canPrev = skip > 0;
  const canNext = skip + limit < total;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Ordini</h1>
          <p className="text-gray-600">Lista completa con filtri e paginazione</p>
        </div>
      </div>

      <AdminCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={status}
              onChange={(e) => {
                setSkip(0);
                setStatus(e.target.value);
              }}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cerca</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Email, nome, checkoutId, payment intent…"
              value={q}
              onChange={(e) => {
                setSkip(0);
                setQ(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>{loading ? 'Caricamento…' : `${total} ordini`}</div>
          <div className="flex gap-2">
            <PrimaryButton
              className={`px-5 py-2 text-base ${canPrev ? '' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!canPrev}
              onClick={async () => setSkip(Math.max(0, skip - limit))}
            >
              Precedente
            </PrimaryButton>
            <PrimaryButton
              className={`px-5 py-2 text-base ${canNext ? '' : 'opacity-50 cursor-not-allowed'}`}
              disabled={!canNext}
              onClick={async () => setSkip(skip + limit)}
            >
              Successivo
            </PrimaryButton>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 bg-white/60">
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Stato</th>
                <th className="px-5 py-3">Totale</th>
                <th className="px-5 py-3">Promo</th>
                <th className="px-5 py-3">Dettagli</th>
              </tr>
            </thead>
            <tbody>
              {(data?.orders || []).map((o) => {
                const name = `${o.customerName || ''} ${o.customerSurname || ''}`.trim();
                return (
                  <tr key={o._id} className="border-t border-black/5">
                    <td className="px-5 py-3 whitespace-nowrap">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString('it-IT') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-gray-900">{name || '—'}</div>
                      <div className="text-gray-600">{o.customerEmail || '—'}</div>
                    </td>
                    <td className="px-5 py-3 capitalize">{o.status}</td>
                    <td className="px-5 py-3">
                      {typeof o.totalPrice === 'number' ? `€ ${o.totalPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-3">{o.promoCode || '—'}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="text-blue-700 hover:underline"
                      >
                        Apri
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {!loading && !(data?.orders || []).length && (
                <tr>
                  <td className="px-5 py-6 text-gray-600" colSpan={6}>
                    Nessun ordine trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
