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
    // Confirmation before status change
    const confirmMessage =
      status === 'canceled'
        ? 'Vuoi annullare questo ordine?'
        : `Vuoi impostare lo stato "${status}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

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

  // Status progress configuration
  const statusSteps = [
    { key: 'pending', label: 'In attesa' },
    { key: 'paid', label: 'Pagato' },
    { key: 'shipped', label: 'Spedito' },
  ];

  const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCanceled = order.status === 'canceled';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Ordine</h1>
          <p className="text-gray-600">{customerLabel}</p>
        </div>
      </div>

      {/* Order Status Progress */}
      <AdminCard className="p-6">
        <div className="font-semibold mb-4">Stato ordine</div>

        {/* Canceled status alert */}
        {isCanceled ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Ordine annullato
            </div>
          </div>
        ) : null}

        {/* Progress bar */}
        <div className="relative">
          {/* Status steps */}
          <div className="flex justify-between items-start relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: isCanceled
                    ? '0%'
                    : `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {statusSteps.map((step, idx) => {
              const isCompleted = !isCanceled && idx <= currentStatusIndex;
              const isCurrent = !isCanceled && idx === currentStatusIndex;
              const canSelect = !isCanceled && !saving && idx > currentStatusIndex;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                  {/* Step circle */}
                  <button
                    type="button"
                    disabled={!canSelect}
                    onClick={() => canSelect && saveStatus(step.key)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-200 border-2
                      ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCanceled
                            ? 'bg-gray-100 border-gray-300 text-gray-400'
                            : canSelect
                              ? 'bg-white border-gray-300 text-gray-400 hover:border-green-500 hover:text-green-500 cursor-pointer'
                              : 'bg-white border-gray-300 text-gray-400'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{idx + 1}</span>
                    )}
                  </button>

                  {/* Step label */}
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-green-600'
                          : isCurrent
                            ? 'text-gray-900'
                            : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </div>
                    {isCurrent && !isCanceled ? (
                      <div className="text-xs text-gray-500 mt-1">In corso</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancel button */}
        {!isCanceled ? (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <PrimaryButton
              className="px-5 py-2 text-base bg-red-500 hover:bg-red-600 text-white"
              disabled={saving}
              onClick={() => saveStatus('canceled')}
            >
              Annulla ordine
            </PrimaryButton>
          </div>
        ) : null}
        <p className="mt-4 text-xs text-gray-500 leading-relaxed">
          Cambia stato in sequenza. L’annullamento è definitivo e blocca avanzamenti.
        </p>
      </AdminCard>

      <div className="grid grid-cols-1 gap-4">
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
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          Totali derivati dai dati ordine salvati. Se mancano, verifica il pagamento Stripe.
        </p>
      </AdminCard>
    </div>
  );
}
