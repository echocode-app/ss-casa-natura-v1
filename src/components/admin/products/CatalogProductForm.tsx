'use client';

import { useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { PRODUCT_LINES } from '@/config/products/product.lines';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';

type Unit = 'ml' | 'l' | 'kg' | 'g';

type CatalogImage = { src: string; alt?: string; publicId?: string };

type CatalogVariant = {
  id: string;
  label: string;
  volume: number;
  unit: Unit;
  weightGrams: number; // Required for shipping
  priceModifier: number; // Required
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
  id?: string; // Auto-generated from slug in new mode
  slug: string;
  sku: string; // Auto-generated, read-only
  title: string;
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
  isBestSeller?: boolean;
  archived?: boolean;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

function safeNumber(value: string, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDraft(draft: CatalogProductDraft): CatalogProductDraft {
  return {
    ...draft,
    lineId: draft.lineId?.trim() || undefined,
    images: (draft.images || [])
      .filter((i) => i.src?.trim())
      .map((i) => ({ src: i.src.trim(), alt: i.alt || '', publicId: i.publicId })),
    variants: (draft.variants || []).filter((v) => v.id?.trim() && v.label?.trim()),
  };
}

/**
 * Generate slug from title (max 20 chars, URL-friendly)
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .slice(0, 20); // Max 20 chars
}

/**
 * Fetch next available SKU from server
 */
async function fetchNextSku(): Promise<string> {
  try {
    const res = await fetch('/api/admin/catalog-products/next-sku', { credentials: 'include' });
    const data = await res.json();
    if (data?.sku) return data.sku;
  } catch {
    // Fallback
  }
  return '0001';
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
  const [isUploadingImage, setIsUploadingImage] = useState<Record<number, boolean>>({});

  const isArchived = !!draft.archived;

  // Auto-generate SKU on mount for new products
  useState(() => {
    if (mode === 'new' && !draft.sku) {
      fetchNextSku().then((sku) => {
        setDraft((p) => ({ ...p, sku }));
      });
    }
  });

  // Auto-generate slug when title changes
  const handleTitleChange = (title: string) => {
    setDraft((p) => ({
      ...p,
      title,
      slug: generateSlug(title),
      id: mode === 'new' ? generateSlug(title) : p.id,
    }));
  };

  const selectedCategorySet = useMemo(
    () => new Set((draft.categoryIds || []).map((c) => String(c))),
    [draft.categoryIds],
  );

  const canSubmit = useMemo(() => {
    return (
      !!draft.title.trim() &&
      !!draft.slug.trim() &&
      !!draft.sku.trim() &&
      !!draft.description.trim() &&
      draft.categoryIds.length > 0 &&
      draft.price > 0 &&
      draft.weightGrams > 0
    );
  }, [draft]);

  const save = async () => {
    if (!canSubmit) {
      notify.error(
        'Compila i campi obbligatori: titolo, descrizione, almeno 1 categoria, prezzo, peso.',
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = normalizeDraft(draft);
      const productId = draft.id || draft.slug;
      const url =
        mode === 'new'
          ? '/api/admin/catalog-products'
          : `/api/admin/catalog-products/${encodeURIComponent(productId)}`;
      const method = mode === 'new' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ ...payload, id: productId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Salvataggio fallito');
      }

      notify.success('Salvato');
      if (mode === 'new') {
        window.location.href = `/admin/products/${encodeURIComponent(productId)}`;
      }
    } catch (e: any) {
      notify.error(e?.message || 'Salvataggio fallito');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadProductImage = async (file: File, idx: number) => {
    setIsUploadingImage((p) => ({ ...p, [idx]: true }));
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'ss-casa-natura-v1/products');

      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: getCsrfHeaders(),
        credentials: 'include',
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Upload fallito');

      const url = String(data?.asset?.url || '');
      const publicId = String(data?.asset?.publicId || '');
      if (!url) throw new Error('Upload fallito: url mancante');

      setDraft((p) => ({
        ...p,
        images: p.images.map((it, i) =>
          i === idx ? { ...it, src: url, publicId: publicId || undefined } : it,
        ),
      }));
      notify.success('Immagine caricata');
    } catch (e: any) {
      notify.error(e?.message || 'Upload fallito');
    } finally {
      setIsUploadingImage((p) => ({ ...p, [idx]: false }));
    }
  };

  const archive = async () => {
    const ok = window.confirm(
      'Archiviare questo prodotto? Non verrà mostrato come override DB (ma lo storico rimane).',
    );
    if (!ok) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/catalog-products/${encodeURIComponent(draft.id || draft.slug)}`,
        {
          method: 'DELETE',
          headers: getCsrfHeaders(),
          credentials: 'include',
        },
      );
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
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)] leading-tight mb-3">
            {mode === 'new' ? 'Nuovo prodotto' : 'Modifica prodotto'}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Campi obbligatori: Titolo, Descrizione, almeno 1 Categoria, Prezzo, Peso.
            <br />
            SKU e Slug generati automaticamente.
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

      <AdminCard className="p-6">
        <div className="font-semibold text-base leading-tight mb-4">Suggerimenti rapidi</div>
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2 leading-relaxed">
          <li>
            <strong>SKU</strong> viene generato automaticamente in formato 0001, 0002, ecc.
          </li>
          <li>
            <strong>Slug</strong> viene generato automaticamente dal titolo (max 20 caratteri).
          </li>
          <li>
            Se il prodotto ha varianti (es. 500 ml / 1 L), compila le varianti. Ogni variante
            richiede <strong>Price modifier</strong> e <strong>Peso (grammi)</strong>.
          </li>
          <li>
            Se non ci sono varianti, usa <strong>Stock (prodotto)</strong> e{' '}
            <strong>Disponibile</strong>.
          </li>
          <li>
            Seleziona almeno 1 <strong>Categoria</strong>. La <strong>Linea</strong> è opzionale.
          </li>
          <li>
            Le immagini richiedono <strong>Alt text obbligatorio</strong>. Ottimizza prima
            dell'upload (max 200KB).
          </li>
        </ul>
      </AdminCard>

      <AdminCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-5">
          Informazioni base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label
              htmlFor="product_title"
              className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
            >
              Titolo *
            </label>
            <input
              id="product_title"
              value={draft.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputBase}
              placeholder="Nome prodotto completo"
            />
          </div>

          <div>
            <label
              htmlFor="product_sku"
              className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
            >
              SKU * (auto-generato)
            </label>
            <input
              id="product_sku"
              value={draft.sku}
              readOnly
              disabled
              className={`${inputBase} bg-gray-100 cursor-not-allowed`}
              placeholder="0001"
            />
            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
              Generato automaticamente (formato: 0001, 0002, ...)
            </div>
          </div>

          <div>
            <label
              htmlFor="product_slug"
              className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
            >
              Slug * (auto-generato)
            </label>
            <input
              id="product_slug"
              value={draft.slug}
              readOnly
              disabled
              className={`${inputBase} bg-gray-100 cursor-not-allowed`}
              placeholder="detersivo-piatti"
            />
            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
              Generato dal titolo (max 20 caratteri, URL-friendly)
            </div>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="product_description"
              className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
            >
              Descrizione *
            </label>
            <textarea
              id="product_description"
              value={draft.description}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              className={inputBase}
              rows={6}
              placeholder="Testo descrittivo del prodotto, ingredienti, modalità d'uso..."
            />
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-5">Categorie</h2>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label
              htmlFor="product_line"
              className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
            >
              Linea (opzionale)
            </label>
            <select
              id="product_line"
              value={draft.lineId || ''}
              onChange={(e) => setDraft((p) => ({ ...p, lineId: e.target.value || undefined }))}
              className={inputBase}
            >
              <option value="">Nessuna linea</option>
              {PRODUCT_LINES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1 leading-relaxed">
              Linee: Lavanda, Brezza Marina, Agrumi di Sicilia, Fiore di Loto, Marsiglia, Neutro
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 leading-relaxed">
              Categorie * (seleziona almeno 1)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRODUCT_CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.categoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDraft((p) => ({ ...p, categoryIds: [...p.categoryIds, cat.id] }));
                      } else {
                        setDraft((p) => ({
                          ...p,
                          categoryIds: p.categoryIds.filter((id) => id !== cat.id),
                        }));
                      }
                    }}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{cat.title}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-2 leading-relaxed">
              Categorie: Saponi, Detergenti, Profumatori, Accessori, Gift Box
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PRODUCT_CATEGORIES.map((c) => {
                const isSelected = selectedCategorySet.has(String(c.id));
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-green-50 border-green-500'
                        : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...(draft.categoryIds || []), String(c.id)]
                          : (draft.categoryIds || []).filter((id) => id !== String(c.id));
                        setDraft((p) => ({ ...p, categoryIds: newIds }));
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm leading-relaxed">{c.title}</span>
                  </label>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-3 leading-relaxed">
              Categorie disponibili: Bucato, Detersivi piatti, Cura Lavastoviglie, Cucina, ecc.
            </div>
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
                  htmlFor={`image_file_${idx}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Immagine (Cloudinary)
                </label>
                <input
                  id={`image_file_${idx}`}
                  type="file"
                  accept="image/*"
                  className={inputBase}
                  disabled={!!isUploadingImage[idx]}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void uploadProductImage(file, idx);
                    e.currentTarget.value = '';
                  }}
                />
                {img.src ? (
                  <div className="mt-2">
                    <img
                      src={img.src}
                      alt={img.alt || 'Anteprima'}
                      className="max-h-40 rounded-md border border-black/5"
                    />
                    <div className="mt-1 text-xs text-gray-500 break-all">{img.src}</div>
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-gray-500">
                    Carica un file: non sono accettati URL esterni.
                  </div>
                )}
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
                setDraft((p) => ({
                  ...p,
                  images: [...p.images, { src: '', alt: '', publicId: undefined }],
                }))
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
                    htmlFor={`variant_weightGrams_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
                  >
                    Peso (grammi) *
                  </label>
                  <input
                    id={`variant_weightGrams_${idx}`}
                    type="number"
                    min={0}
                    step={1}
                    value={v.weightGrams ?? 0}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        variants: p.variants.map((it, i) =>
                          i === idx ? { ...it, weightGrams: safeNumber(e.target.value, 0) } : it,
                        ),
                      }))
                    }
                    className={inputBase}
                    placeholder="500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor={`variant_priceModifier_${idx}`}
                    className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
                  >
                    Price modifier (EUR) *
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
                    placeholder="0.00"
                  />
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                    +/- rispetto al prezzo base
                  </div>
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
                      id: `v${p.variants.length + 1}`,
                      label: '',
                      volume: 0,
                      unit: 'ml',
                      weightGrams: 0,
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

      <AdminCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-5">Badge e promo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 text-sm text-gray-700 leading-relaxed">
            <input
              type="checkbox"
              checked={draft.promoEligible ?? false}
              onChange={(e) => setDraft((p) => ({ ...p, promoEligible: e.target.checked }))}
              className="w-4 h-4"
            />
            <span>Promo eleggibile</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-700 leading-relaxed">
            <input
              type="checkbox"
              checked={draft.isBestSeller ?? false}
              onChange={(e) => setDraft((p) => ({ ...p, isBestSeller: e.target.checked }))}
              className="w-4 h-4"
            />
            <span>Best seller</span>
          </label>
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
