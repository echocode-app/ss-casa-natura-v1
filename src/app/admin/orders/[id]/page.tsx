'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';

type Order = any;

type Response = {
  success?: boolean;
  order?: Order;
  error?: string;
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = String((params as any)?.id || '');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Response | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { credentials: 'include' });
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const order = data?.order;

  const customerLabel = useMemo(() => {
    if (!order) return '—';
    const name = `${order.customerName || ''} ${order.customerSurname || ''}`.trim();
    return name || order.customerEmail || '—';
  }, [order]);

  const saveStatus = async (status: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Errore');
      notify.success('Stato aggiornato');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Errore');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Ordine</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Ordine</h1>
        <div className="mt-4 text-gray-600">Ordine non trovato.</div>
      </div>
    );
  }

  const isGuest = !order.userId;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Ordine</h1>
          <p className="text-gray-600">{customerLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['pending', 'paid', 'shipped', 'canceled'].map((s) => (
            <PrimaryButton
              key={s}
              className="px-5 py-2 text-base"
              disabled={saving}
              onClick={async () => saveStatus(s)}
            >
              Imposta: {s}
            </PrimaryButton>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard className="p-5">
          <div className="font-semibold">Dati pagamento</div>
          <div className="mt-3 text-sm text-gray-700 space-y-2">
            <div>
              <span className="text-gray-600">Stripe PaymentIntent:</span>{' '}
              <span className="font-medium">{order.stripePaymentIntentId || '—'}</span>
            </div>
            <div>
              <span className="text-gray-600">Checkout ID:</span>{' '}
              <span className="font-medium">{order.checkoutId || '—'}</span>
            </div>
            <div>
              <span className="text-gray-600">Stato:</span>{' '}
              <span className="font-medium">{order.status}</span>
            </div>
            <div>
              <span className="text-gray-600">Pagato il:</span>{' '}
              <span className="font-medium">
                {order.paidAt ? new Date(order.paidAt).toLocaleString('it-IT') : '—'}
              </span>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="font-semibold">Cliente</div>
          <div className="mt-3 text-sm text-gray-700 space-y-2">
            <div>
              <span className="text-gray-600">Tipo:</span>{' '}
              <span className="font-medium">{isGuest ? 'Guest' : 'Account'}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>{' '}
              <span className="font-medium">{order.customerEmail || '—'}</span>
            </div>
            <div>
              <span className="text-gray-600">Telefono:</span>{' '}
              <span className="font-medium">{order.customerPhone || '—'}</span>
            </div>
            <div>
              <span className="text-gray-600">Nome:</span>{' '}
              <span className="font-medium">
                {`${order.customerName || ''} ${order.customerSurname || ''}`.trim() || '—'}
              </span>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Indirizzo di spedizione</div>
        <div className="mt-3 text-sm text-gray-700 space-y-1">
          {order.shippingAddress ? (
            <>
              <div>
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2
                  ? `, ${order.shippingAddress.addressLine2}`
                  : ''}
              </div>
              <div>
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
                {order.shippingAddress.province ? ` (${order.shippingAddress.province})` : ''}
              </div>
              <div>{order.shippingAddress.country}</div>
              {order.shippingAddress.company ? (
                <div>
                  <span className="text-gray-600">Azienda:</span> {order.shippingAddress.company}
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-gray-600">—</div>
          )}
        </div>
      </AdminCard>

      <AdminCard className="p-0 overflow-hidden">
        <div className="px-5 py-4 font-semibold">Prodotti</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 bg-white/60">
                <th className="px-5 py-3">Titolo</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Q.tà</th>
                <th className="px-5 py-3">Prezzo</th>
              </tr>
            </thead>
            <tbody>
              {(order.products || []).map((p: any, idx: number) => (
                <tr
                  key={`${p.productId}-${p.variantId}-${idx}`}
                  className="border-t border-black/5"
                >
                  <td className="px-5 py-3">
                    <div className="text-gray-900">{p.title || '—'}</div>
                    <div className="text-gray-600">
                      {p.variantId ? `Variante: ${p.variantId}` : ''}
                    </div>
                  </td>
                  <td className="px-5 py-3">{p.sku || '—'}</td>
                  <td className="px-5 py-3">{p.quantity}</td>
                  <td className="px-5 py-3">
                    {typeof p.price === 'number' ? `€ ${p.price.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <div className="font-semibold">Totali</div>
        <div className="mt-3 text-sm text-gray-700 space-y-2">
          <div>
            <span className="text-gray-600">Subtotale:</span>{' '}
            <span className="font-medium">
              {typeof order.subtotal === 'number' ? `€ ${order.subtotal.toFixed(2)}` : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Sconto:</span>{' '}
            <span className="font-medium">
              {typeof order.discount === 'number' ? `€ ${order.discount.toFixed(2)}` : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Promo:</span>{' '}
            <span className="font-medium">{order.promoCode || '—'}</span>
          </div>
          <div>
            <span className="text-gray-600">Promo sconto:</span>{' '}
            <span className="font-medium">
              {typeof order.promoDiscount === 'number'
                ? `€ ${order.promoDiscount.toFixed(2)}`
                : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Spedizione:</span>{' '}
            <span className="font-medium">
              {typeof order.shippingPrice === 'number'
                ? `€ ${order.shippingPrice.toFixed(2)}`
                : '—'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Totale:</span>{' '}
            <span className="font-semibold">
              {typeof order.totalPrice === 'number' ? `€ ${order.totalPrice.toFixed(2)}` : '—'}
            </span>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
