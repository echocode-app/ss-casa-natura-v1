'use client';

import { useEffect, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { useAuth } from '@/components/layout/AuthContext';

type ShippingSettings = {
  pricePerGram?: number;
  pricePerKg?: number;
  fixedFee?: number;
  recurringFee?: number;
};

type SiteSettingsResponse = {
  success?: boolean;
  settings?: {
    shipping?: ShippingSettings;
  };
  error?: string;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

export default function AdminShippingPage() {
  const { user } = useAuth();
  const canEdit = user?.role === 'developer' || user?.role === 'superadmin';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<{
    pricePerGram: string;
    fixedFee: string;
    recurringFee: string;
  }>({
    pricePerGram: '0',
    fixedFee: '0',
    recurringFee: '0',
  });

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/site-settings', { credentials: 'include' });
      const data: SiteSettingsResponse = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Impossibile caricare le impostazioni');
      }

      const shipping = data?.settings?.shipping ?? {};
      const pricePerGram =
        shipping.pricePerGram ??
        (shipping.pricePerKg !== undefined ? Number(shipping.pricePerKg) / 1000 : 0);
      setDraft({
        pricePerGram: String(pricePerGram ?? 0),
        fixedFee: String(shipping.fixedFee ?? 0),
        recurringFee: String(shipping.recurringFee ?? 0),
      });
    } catch (e: any) {
      notify.error(e?.message || 'Impossibile caricare le impostazioni');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    try {
      const payload = {
        shipping: {
          pricePerGram: Math.max(0, Number(draft.pricePerGram || 0)),
          fixedFee: Math.max(0, Number(draft.fixedFee || 0)),
          recurringFee: Math.max(0, Number(draft.recurringFee || 0)),
        },
      };

      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Salvataggio fallito');
      }
      notify.success('Salvato');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Salvataggio fallito');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Spedizione</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Spedizione</h1>
        </div>
        <div className="flex gap-2">
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Aggiorna
          </PrimaryButton>
          <PrimaryButton
            className="px-6 py-3 text-base"
            onClick={save}
            disabled={!canEdit || isSaving}
          >
            Salva
          </PrimaryButton>
        </div>
      </div>

      <AdminCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Tariffe</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              I valori sono usati in checkout e nel preventivo spedizione.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed mt-1">
              Attenzione: la tariffa è per grammo. Se vuoi €2/kg, inserisci 0.002 (perché 1 kg =
              1000 g).
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tariffa per grammi (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={draft.pricePerGram}
              onChange={(e) => setDraft((p) => ({ ...p, pricePerGram: e.target.value }))}
              disabled={!canEdit}
              className={`${inputBase} ${!canEdit ? 'bg-gray-100' : ''}`}
            />
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Formula: peso totale (g) × tariffa per grammo + costo fisso.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo fisso (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={draft.fixedFee}
              onChange={(e) => setDraft((p) => ({ ...p, fixedFee: e.target.value }))}
              disabled={!canEdit}
              className={`${inputBase} ${!canEdit ? 'bg-gray-100' : ''}`}
            />
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Quota fissa per ordine (si somma al calcolo a peso).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spedizioni ricorrenti (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={draft.recurringFee}
              onChange={(e) => setDraft((p) => ({ ...p, recurringFee: e.target.value }))}
              disabled={!canEdit}
              className={`${inputBase} ${!canEdit ? 'bg-gray-100' : ''}`}
            />
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Importo fisso per “Spedizioni ricorrenti” (non dipende dal peso).
            </p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
