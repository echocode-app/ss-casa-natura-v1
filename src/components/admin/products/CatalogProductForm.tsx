'use client';

import { useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { PRODUCT_LINES } from '@/config/products/product.lines';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';

type Unit = 'ml' | 'l' | 'kg' | 'g';

type CatalogImage = { src: string; alt?: string };

type CatalogVariant = {
  id: string;
  label: string;
  volume: number;
  unit: Unit;
  priceModifier?: number;
  stock?: number;
  isAvailable?: boolean;
};

type Discount = {
  type: 'percentage' | 'fixed';
  value: number;
  startAt?: string;
  endAt?: string;
};

export type CatalogProductDraft = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  shortDescription?: string;
  description: string;
  categoryIds: string[];
  lineId?: string;
  images: CatalogImage[];
  variants: CatalogVariant[];
  weightGrams: number;
  price: number;
  currency: 'EUR';
  stock?: number;
  isAvailable?: boolean;
  discount?: Discount;
  promoEligible?: boolean;
  isEco?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isSeasonal?: boolean;
  relatedProductIds?: string[];
  archived?: boolean;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

function safeNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseCsv(value: string) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeDraft(draft: CatalogProductDraft): CatalogProductDraft {
  return {
    ...draft,
    shortDescription: draft.shortDescription?.trim() || undefined,
    lineId: draft.lineId?.trim() || undefined,
    images: (draft.images || [])
      .filter((i) => i.src?.trim())
      .map((i) => ({ src: i.src.trim(), alt: i.alt })),
    variants: (draft.variants || []).filter((v) => v.id?.trim() && v.label?.trim()),
  };
}

export default function CatalogProductForm({
  mode,
  initial,
}: {
  mode: 'new' | 'edit';
  initial: CatalogProductDraft;
}) {
  const [draft, setDraft] = useState<CatalogProductDraft>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isArchived = !!draft.archived;

  const categoryCsv = useMemo(() => (draft.categoryIds || []).join(', '), [draft.categoryIds]);
  const relatedCsv = useMemo(() => {
    return draft.relatedProductIds && draft.relatedProductIds.length
      ? draft.relatedProductIds.join(', ')
      : '';
  }, [draft.relatedProductIds]);

  const selectedCategorySet = useMemo(
    () => new Set((draft.categoryIds || []).map((c) => String(c))),
    [draft.categoryIds],
  );

  const canSubmit = useMemo(() => {
    return (
      !!draft.id.trim() &&
      !!draft.title.trim() &&
      !!draft.slug.trim() &&
      !!draft.sku.trim() &&
      !!draft.description.trim()
    );
  }, [draft]);

  const save = async () => {
    if (!canSubmit) {
      notify.error('Compila i campi obbligatori (ID, titolo, slug, SKU, descrizione).');
      return;
    }

    setIsSaving(true);
    try {
      const payload = normalizeDraft(draft);
      const url =
        mode === 'new'
          ? '/api/admin/catalog-products'
          : `/api/admin/catalog-products/${encodeURIComponent(draft.id)}`;
      const method = mode === 'new' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Salvataggio fallito');
      }

      notify.success('Salvato');
      if (mode === 'new') {
        window.location.href = `/admin/products/${encodeURIComponent(draft.id)}`;
      }
    } catch (e: any) {
      notify.error(e?.message || 'Salvataggio fallito');
    } finally {
      setIsSaving(false);
    }
  };

  const archive = async () => {
    const ok = window.confirm(
      'Archiviare questo prodotto? Non verrà mostrato come override DB (ma lo storico rimane).',
    );
    if (!ok) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/catalog-products/${encodeURIComponent(draft.id)}`, {
        method: 'DELETE',
        headers: getCsrfHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Operazione fallita');
      }
      notify.success('Archiviato');
      setDraft((prev) => ({ ...prev, archived: true }));
    } catch (e: any) {
      notify.error(e?.message || 'Operazione fallita');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">
            {mode === 'new' ? 'Nuovo prodotto' : 'Modifica prodotto'}
          </h1>
          <p className="text-gray-600 mt-1">
            Override DB del catalogo (influisce sulla vetrina). Campi obbligatori: ID, titolo, slug,
            SKU, descrizione.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PrimaryButton className="px-6 py-3 text-base" onClick={save} disabled={isSaving}>
            {isSaving ? 'Salvataggio…' : 'Salva'}
          </PrimaryButton>
          {mode === 'edit' && (
            <PrimaryButton
              className="px-6 py-3 text-base bg-red-600 hover:bg-red-700"
              onClick={archive}
              disabled={isDeleting}
            >
              {isDeleting ? 'Operazione…' : 'Archivia'}
            </PrimaryButton>
          )}
        </div>
      </div>

      <AdminCard className="p-5">
        <div className="font-semibold">Suggerimenti rapidi</div>
        <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
          <li>
            Se il prodotto ha varianti (es. 500 ml / 1 L), compila le varianti e usa stock a livello
            variante.
          </li>
          <li>
            Se non ci sono varianti, usa <span className="font-semibold">Stock (prodotto)</span> e
            <span className="font-semibold"> Disponibile</span>.
          </li>
          <li>
            Seleziona <span className="font-semibold">Linea</span> e
            <span className="font-semibold"> Categorie</span> dai menu: così restano coerenti con la
            configurazione del sito.
          </li>
        </ul>
      </AdminCard>

      <AdminCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 mb-2">
              ID *
            </label>
            <input
              id="product_id"
              value={draft.id}
              onChange={(e) => setDraft((p) => ({ ...p, id: e.target.value }))}
              disabled={mode === 'edit'}
              className={inputBase}
              placeholder="es. crema-viso-50ml"
            />
            {mode === 'edit' && (
              <div className="text-xs text-gray-500 mt-1">L'ID non è modificabile.</div>
            )}
          </div>

          <div>
            <label htmlFor="product_sku" className="block text-sm font-medium text-gray-700 mb-2">
              SKU *
            </label>
            <input
              id="product_sku"
              value={draft.sku}
              onChange={(e) => setDraft((p) => ({ ...p, sku: e.target.value }))}
              className={inputBase}
              placeholder="es. CN-000123"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="product_title" className="block text-sm font-medium text-gray-700 mb-2">
              Titolo *
            </label>
            <input
              id="product_title"
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              className={inputBase}
              placeholder="Nome prodotto"
            />
          </div>

          <div>
            <label htmlFor="product_slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              id="product_slug"
              value={draft.slug}
              onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
              className={inputBase}
              placeholder="es. crema-viso"
            />
          </div>

          <div>
            <label htmlFor="product_line" className="block text-sm font-medium text-gray-700 mb-2">
              Linea (opzionale)
            </label>
            <select
              id="product_line"
              value={draft.lineId || ''}
              onChange={(e) => setDraft((p) => ({ ...p, lineId: e.target.value || undefined }))}
              className={inputBase}
            >
              <option value="">—</option>
              {PRODUCT_LINES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Valori presi da src/config/products.</div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="product_shortDescription"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrizione breve (max 300)
            </label>
            <textarea
              id="product_shortDescription"
              value={draft.shortDescription || ''}
              onChange={(e) => setDraft((p) => ({ ...p, shortDescription: e.target.value }))}
              className={inputBase}
              rows={2}
              placeholder="(opzionale)"
            />
            <div className="text-xs text-gray-500 mt-1">
              {(draft.shortDescription || '').length}/300
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="product_description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrizione *
            </label>
            <textarea
              id="product_description"
              value={draft.description}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              className={inputBase}
              rows={6}
              placeholder="Testo descrittivo del prodotto…"
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Prezzo e spedizione</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label htmlFor="product_price" className="block text-sm font-medium text-gray-700 mb-2">
              Prezzo (EUR) *
            </label>
            <input
              id="product_price"
              type="number"
              min={0}
              step={0.01}
              value={draft.price}
              onChange={(e) => setDraft((p) => ({ ...p, price: safeNumber(e.target.value, 0) }))}
              className={inputBase}
            />
          </div>
          <div>
            <label
              htmlFor="product_weight"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Peso (grammi) *
            </label>
            <input
              id="product_weight"
              type="number"
              min={0}
              step={1}
              value={draft.weightGrams}
              onChange={(e) =>
                setDraft((p) => ({ ...p, weightGrams: safeNumber(e.target.value, 0) }))
              }
              className={inputBase}
            />
          </div>
          <div>
            <label
              htmlFor="product_currency"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Valuta
            </label>
            <input
              id="product_currency"
              value={draft.currency}
              disabled
              className={inputBase + ' bg-gray-50'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.isAvailable ?? true}
              onChange={(e) => setDraft((p) => ({ ...p, isAvailable: e.target.checked }))}
              aria-label="Disponibile (prodotto)"
              title="Disponibile (prodotto)"
            />
            <span className="text-sm text-gray-700">Disponibile (prodotto)</span>
          </label>
          <div>
            <label htmlFor="product_stock" className="block text-sm font-medium text-gray-700 mb-2">
              Stock (prodotto)
            </label>
            <input
              id="product_stock"
              type="number"
              min={0}
              step={1}
              value={draft.stock ?? 0}
              onChange={(e) => setDraft((p) => ({ ...p, stock: safeNumber(e.target.value, 0) }))}
              className={inputBase}
            />
          </div>
        </div>

        {mode === 'edit' && (
          <div className="mt-4 text-sm">
            <span className={isArchived ? 'text-red-700' : 'text-gray-600'}>
              Stato: {isArchived ? 'Archiviato' : 'Attivo'}
            </span>
          </div>
        )}
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Categorie e relazioni</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="product_categories_select"
            >
              Categorie
            </label>
            <select
              id="product_categories_select"
              multiple
              value={(draft.categoryIds || []).map(String)}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setDraft((p) => ({ ...p, categoryIds: selected }));
              }}
              className={inputBase}
              size={Math.min(8, Math.max(4, PRODUCT_CATEGORIES.length))}
            >
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Selezione multipla: tieni premuto ⌘ (Mac) o Ctrl (Windows).
            </div>

            <div className="mt-3">
              <label
                htmlFor="product_categoryIds_csv"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Categoria IDs (CSV) — opzionale
              </label>
              <input
                id="product_categoryIds_csv"
                value={categoryCsv}
                onChange={(e) => setDraft((p) => ({ ...p, categoryIds: parseCsv(e.target.value) }))}
                className={inputBase}
                placeholder="es. detersivi-piatti, sgrassatori"
              />
              {selectedCategorySet.size > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Selezionate: {Array.from(selectedCategorySet).join(', ')}
                </div>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="product_relatedProductIds"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Related Product IDs (CSV)
            </label>
            <input
              id="product_relatedProductIds"
              value={relatedCsv}
              onChange={(e) =>
                setDraft((p) => ({ ...p, relatedProductIds: parseCsv(e.target.value) }))
              }
              className={inputBase}
              placeholder="es. prodotto-1, prodotto-2"
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Immagini</h2>
        <div className="mt-4 space-y-3">
          {draft.images.map((img, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
              <div className="md:col-span-7">
                <label
                  htmlFor={`image_src_${idx}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  URL immagine
                </label>
                <input
                  id={`image_src_${idx}`}
                  value={img.src}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      images: p.images.map((it, i) =>
                        i === idx ? { ...it, src: e.target.value } : it,
                      ),
                    }))
                  }
                  className={inputBase}
                  placeholder="/images/prodotti/xxx.jpg oppure https://..."
                />
              </div>
              <div className="md:col-span-4">
                <label
                  htmlFor={`image_alt_${idx}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alt (opzionale)
                </label>
                <input
                  id={`image_alt_${idx}`}
                  value={img.alt || ''}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      images: p.images.map((it, i) =>
                        i === idx ? { ...it, alt: e.target.value } : it,
                      ),
                    }))
                  }
                  className={inputBase}
                  placeholder="(opzionale)"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                <button
                  type="button"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() =>
                    setDraft((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))
                  }
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <div>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() =>
                setDraft((p) => ({ ...p, images: [...p.images, { src: '', alt: '' }] }))
              }
            >
              + Aggiungi immagine
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Varianti</h2>
        <div className="mt-4 space-y-4">
          {draft.variants.map((v, idx) => (
            <div key={idx} className="border border-black/5 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-3">
                  <label
                    htmlFor={`variant_id_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    ID variante
                  </label>
                  <input
                    id={`variant_id_${idx}`}
                    value={v.id}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, id: e.target.value } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                    placeholder="es. 50ml"
                  />
                </div>
                <div className="md:col-span-5">
                  <label
                    htmlFor={`variant_label_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Etichetta
                  </label>
                  <input
                    id={`variant_label_${idx}`}
                    value={v.label}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, label: e.target.value } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                    placeholder="es. 50 ml"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor={`variant_volume_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Volume
                  </label>
                  <input
                    id={`variant_volume_${idx}`}
                    type="number"
                    min={0}
                    step={0.01}
                    value={v.volume}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, volume: safeNumber(e.target.value, 0) } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor={`variant_unit_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Unità
                  </label>
                  <select
                    id={`variant_unit_${idx}`}
                    value={v.unit}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, unit: e.target.value as Unit } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                  >
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor={`variant_priceModifier_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price modifier (opz.)
                  </label>
                  <input
                    id={`variant_priceModifier_${idx}`}
                    type="number"
                    step={0.01}
                    value={v.priceModifier ?? 0}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, priceModifier: safeNumber(e.target.value, 0) } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                  />
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor={`variant_stock_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Stock (variante)
                  </label>
                  <input
                    id={`variant_stock_${idx}`}
                    type="number"
                    min={0}
                    step={1}
                    value={v.stock ?? 0}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, stock: safeNumber(e.target.value, 0) } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                  />
                </div>

                <label className="md:col-span-2 flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    checked={v.isAvailable ?? true}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, isAvailable: e.target.checked } : it,
                        ),
                      }))
                    }
                    aria-label="Disponibile (variante)"
                    title="Disponibile (variante)"
                  />
                  <span className="text-sm text-gray-700">Disponibile</span>
                </label>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.filter((_, i) => i !== idx),
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() =>
                setDraft((p) => ({
                  ...p,
                  variants: [
                    ...p.variants,
                    {
                      id: '',
                      label: '',
                      volume: 0,
                      unit: 'ml',
                      priceModifier: 0,
                      stock: 0,
                      isAvailable: true,
                    },
                  ],
                }))
              }
            >
              + Aggiungi variante
            </button>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Badge e promo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {(
            [
              ['promoEligible', 'Promo eleggibile'],
              ['isEco', 'Eco'],
              ['isNew', 'Nuovo'],
              ['isBestSeller', 'Best seller'],
              ['isSeasonal', 'Stagionale'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={(draft as any)[key] ?? false}
                onChange={(e) => setDraft((p) => ({ ...(p as any), [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="discount_type" className="block text-sm font-medium text-gray-700 mb-2">
              Sconto tipo
            </label>
            <select
              id="discount_type"
              value={draft.discount?.type || ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  discount: e.target.value
                    ? { type: e.target.value as Discount['type'], value: p.discount?.value ?? 0 }
                    : undefined,
                }))
              }
              className={inputBase}
            >
              <option value="">Nessuno</option>
              <option value="percentage">Percentuale</option>
              <option value="fixed">Fisso</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="discount_value"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sconto valore
            </label>
            <input
              id="discount_value"
              type="number"
              min={0}
              step={0.01}
              value={draft.discount?.value ?? 0}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  discount: p.discount
                    ? { ...p.discount, value: safeNumber(e.target.value, 0) }
                    : undefined,
                }))
              }
              className={inputBase}
              disabled={!draft.discount}
            />
          </div>
          <div>
            <label
              htmlFor="discount_startAt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              StartAt (opz.)
            </label>
            <input
              id="discount_startAt"
              value={draft.discount?.startAt || ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  discount: p.discount ? { ...p.discount, startAt: e.target.value } : undefined,
                }))
              }
              className={inputBase}
              disabled={!draft.discount}
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div>
            <label
              htmlFor="discount_endAt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              EndAt (opz.)
            </label>
            <input
              id="discount_endAt"
              value={draft.discount?.endAt || ''}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  discount: p.discount ? { ...p.discount, endAt: e.target.value } : undefined,
                }))
              }
              className={inputBase}
              disabled={!draft.discount}
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>
      </AdminCard>

      <div className="flex justify-end">
        <PrimaryButton className="px-6 py-3 text-base" onClick={save} disabled={isSaving}>
          {isSaving ? 'Salvataggio…' : 'Salva'}
        </PrimaryButton>
      </div>
    </div>
  );
}
