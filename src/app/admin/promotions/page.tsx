'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';

type PromoBarDraft = {
  enabled: boolean;
  text?: string;
  textIt?: string;
  textEn?: string;
  href?: string;
  bgColor?: string;
  textColor?: string;
};

type SiteSettingsResponse = {
  success?: boolean;
  settings?: {
    promoBar?: Partial<PromoBarDraft>;
  };
  error?: string;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

function clampText(value: string, max: number) {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

export default function AdminPromotionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<PromoBarDraft>({
    enabled: false,
    textIt: '',
    textEn: '',
    href: '/prodotti',
    bgColor: '#C3FF8A',
    textColor: '#000000',
  });

  const itLen = useMemo(() => (draft.textIt || '').length, [draft.textIt]);
  const enLen = useMemo(() => (draft.textEn || '').length, [draft.textEn]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/site-settings', { credentials: 'include' });
      const data: SiteSettingsResponse = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Impossibile caricare le impostazioni');
      }

      const promo = data?.settings?.promoBar ?? ({} as Partial<PromoBarDraft>);
      setDraft({
        enabled: !!promo.enabled,
        href: promo.href || '/prodotti',
        bgColor: promo.bgColor || '#C3FF8A',
        textColor: promo.textColor || '#000000',
        text: promo.text,
        textIt: promo.textIt || '',
        textEn: promo.textEn || '',
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
    setIsSaving(true);
    try {
      const payload = {
        promoBar: {
          enabled: !!draft.enabled,
          href: (draft.href || '').trim() || '/prodotti',
          bgColor: (draft.bgColor || '').trim() || '#C3FF8A',
          textColor: (draft.textColor || '').trim() || '#000000',
          textIt: clampText((draft.textIt || '').trim(), 300) || null,
          textEn: clampText((draft.textEn || '').trim(), 300) || null,
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
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Promozioni</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Promozioni</h1>
          <p className="text-gray-600 mt-1">Gestione PromoBar (testo EN/IT, colori, link)</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Aggiorna
          </PrimaryButton>
          <PrimaryButton className="px-6 py-3 text-base" onClick={save} disabled={isSaving}>
            {isSaving ? 'Salvataggio…' : 'Salva'}
          </PrimaryButton>
        </div>
      </div>

      <AdminCard className="p-5">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={!!draft.enabled}
            onChange={(e) => setDraft((p) => ({ ...p, enabled: e.target.checked }))}
          />
          Abilita PromoBar
        </label>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              value={draft.href || ''}
              onChange={(e) => setDraft((p) => ({ ...p, href: e.target.value }))}
              placeholder="/prodotti"
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colore sfondo</label>
            <input
              value={draft.bgColor || ''}
              onChange={(e) => setDraft((p) => ({ ...p, bgColor: e.target.value }))}
              placeholder="#C3FF8A"
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Colore testo</label>
            <input
              value={draft.textColor || ''}
              onChange={(e) => setDraft((p) => ({ ...p, textColor: e.target.value }))}
              placeholder="#000000"
              className={inputBase}
            />
          </div>
        </div>
      </AdminCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Testo (Italiano)</div>
            <div className="text-sm text-gray-600">{itLen}/300</div>
          </div>
          <textarea
            value={draft.textIt || ''}
            onChange={(e) => setDraft((p) => ({ ...p, textIt: clampText(e.target.value, 300) }))}
            className={`${inputBase} mt-3 min-h-[120px]`}
            placeholder="Testo PromoBar in italiano (max 300 caratteri)"
          />
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Text (English)</div>
            <div className="text-sm text-gray-600">{enLen}/300</div>
          </div>
          <textarea
            value={draft.textEn || ''}
            onChange={(e) => setDraft((p) => ({ ...p, textEn: clampText(e.target.value, 300) }))}
            className={`${inputBase} mt-3 min-h-[120px]`}
            placeholder="PromoBar text in English (max 300 characters)"
          />
        </AdminCard>
      </div>
    </div>
  );
}
