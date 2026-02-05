'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { PRODUCT_LINES } from '@/config/products/product.lines';

type PromoBarDraft = {
  enabled: boolean;
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

const LINK_OPTIONS = [
  {
    value: '/prodotti',
    label: 'Tutti i prodotti',
    description: 'Pagina con l’elenco completo dei prodotti.',
  },
  ...PRODUCT_CATEGORIES.map((cat) => ({
    value: `/prodotti?subcategory=${cat.id}`,
    label: `Sottocategoria: ${cat.title}`,
    description: `Pagina filtrata per sottocategoria "${cat.title}".`,
  })),
  ...PRODUCT_FILTERS.map((cat) => ({
    value: `/prodotti?category=${cat.id}`,
    label: `Categoria: ${cat.title}`,
    description: `Pagina filtrata per categoria "${cat.title}".`,
  })),
  ...PRODUCT_LINES.map((line) => ({
    value: `/linee/${line.id}`,
    label: `Linea: ${line.title}`,
    description: `Pagina della linea "${line.title}".`,
  })),
];

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
      const hasItalianText = Boolean((draft.textIt || '').trim());
      const shouldEnable = !!draft.enabled && hasItalianText;

      if (draft.enabled && !hasItalianText) {
        notify.error('Inserisci almeno il Testo (Italiano) per abilitare la PromoBar.');
        setDraft((p) => ({ ...p, enabled: false }));
      }

      const payload = {
        promoBar: {
          enabled: shouldEnable,
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
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Promozioni</h1>
          <p className="text-gray-600 mt-1">Gestione PromoBar (testo EN/IT, colori, link)</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Aggiorna
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
        <p className="mt-2 text-xs text-gray-500 leading-relaxed">
          Attiva/disattiva la barra promozionale sul sito. Se manca il testo italiano, la PromoBar
          non viene abilitata.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <select
              value={draft.href || '/prodotti'}
              onChange={(e) => setDraft((p) => ({ ...p, href: e.target.value }))}
              className={inputBase}
            >
              {LINK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="mt-2 text-xs text-gray-500 leading-relaxed">
              {LINK_OPTIONS.find((opt) => opt.value === (draft.href || '/prodotti'))?.description ||
                'Seleziona il link per la PromoBar.'}
            </div>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              Seleziona una sola destinazione dalla lista. Link non presenti vengono rifiutati.
            </p>
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
        <p className="mt-3 text-xs text-gray-500 leading-relaxed">
          Colori in formato esadecimale (es. #C3FF8A). Se invalidi, verranno salvati come valore
          testo ma potrebbero non rendere correttamente.
        </p>
      </AdminCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Campo obbligatorio per attivare la PromoBar.
          </p>
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
          <p className="mt-2 text-xs text-gray-500 leading-relaxed">
            Testo opzionale. Se mancante, per EN verrà mostrato il testo italiano.
          </p>
        </AdminCard>
      </div>

      <PrimaryButton className="w-full px-6 py-4 text-base" onClick={save} disabled={isSaving}>
        {isSaving ? 'Salvataggio…' : 'Salva'}
      </PrimaryButton>
    </div>
  );
}
