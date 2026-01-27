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
  weightGrams: number;
  price: number; // Price for this variant
  stock?: number;
  isAvailable?: boolean;
  isBestSeller?: boolean;
};

type Discount = {
  type: 'percentage' | 'fixed';
  value: number;
  startAt?: string;
  endAt?: string;
};

export type CatalogProductDraft = {
  id?: string;
  slug: string;
  sku: string;
  title: string;
  description: string;
  categoryIds: string[];
  lineId?: string;
  images: CatalogImage[];
  variants: CatalogVariant[];
  currency: 'EUR';
  discount?: Discount;
  archived?: boolean;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Helper to get field error
  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName]?.[0];
  };

  // Helper to get field style
  const getFieldStyle = (fieldName: string, baseClass: string = inputBase) => {
    const hasError = validationErrors[fieldName];
    if (hasError) {
      return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return baseClass;
  };

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
    // Check if image has alt text
    const hasValidImage =
      draft.images.length === 0 || (draft.images[0]?.src && draft.images[0]?.alt?.trim());

    // Check if at least one variant has price and weight
    const hasValidVariant = draft.variants.some(
      (v) => v.price > 0 && v.weightGrams > 0 && v.volume > 0,
    );

    return (
      !!draft.title.trim() &&
      !!draft.slug.trim() &&
      !!draft.sku.trim() &&
      !!draft.description.trim() &&
      draft.categoryIds.length > 0 &&
      hasValidImage &&
      hasValidVariant
    );
  }, [draft]);

  const save = async () => {
    if (!canSubmit) {
      // More specific error messages
      if (draft.images.length > 0 && !draft.images[0]?.alt?.trim()) {
        notify.error("Alt text obbligatorio per l'immagine del prodotto.");
        return;
      }
      if (!draft.variants.some((v) => v.price > 0 && v.weightGrams > 0)) {
        notify.error('Almeno una variante deve avere prezzo e peso validi.');
        return;
      }
      notify.error(
        'Compila i campi obbligatori: titolo, descrizione, almeno 1 categoria, almeno 1 variante valida.',
      );
      return;
    }

    setIsSaving(true);
    setValidationErrors({});
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
        if (data?.errorCode === 'VALIDATION_FAILED' && data?.details) {
          setValidationErrors(data.details);
          notify.error('Errori di validazione. Controlla i campi evidenziati.');
          return;
        }
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
            Campi obbligatori: Titolo, Descrizione, almeno 1 Categoria, Immagine con Alt text,
            almeno 1 Variante con Prezzo e Peso.
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
            Ogni prodotto deve avere almeno una variante. Ogni variante richiede{' '}
            <strong>Volume</strong>, <strong>Unità</strong>, <strong>Prezzo</strong>,{' '}
            <strong>Peso (grammi)</strong>, <strong>Stock</strong> e <strong>Disponibile</strong>.
          </li>
          <li>
            Seleziona almeno 1 <strong>Categoria</strong>. La <strong>Linea</strong> è opzionale.
          </li>
          <li>
            <strong>Immagine:</strong> Usa una sola immagine ottimizzata (max 200 KB).
            <strong> Alt text obbligatorio</strong> - descrive l'immagine per accessibilità e SEO.
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
              className={getFieldStyle('title')}
              placeholder="Nome prodotto completo"
            />
            {getFieldError('title') && (
              <div className="text-xs text-red-600 mt-1">{getFieldError('title')}</div>
            )}
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
              className={getFieldStyle('description')}
              rows={6}
              placeholder="Testo descrittivo del prodotto, ingredienti, modalità d'uso..."
            />
            {getFieldError('description') && (
              <div className="text-xs text-red-600 mt-1">{getFieldError('description')}</div>
            )}
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
            <div className="grid grid-cols-1 gap-3">
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
            {getFieldError('categoryIds') && (
              <div className="text-xs text-red-600 mt-2">{getFieldError('categoryIds')}</div>
            )}
            <div className="text-xs text-gray-500 mt-2 leading-relaxed">
              Categorie: Saponi, Detergenti, Profumatori, Accessori, Gift Box
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Categorie e relazioni</h2>
        <div className="grid grid-cols-1 gap-4 mt-4">
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="product_categories_select"
            >
              Categorie
            </label>
            <div className="grid grid-cols-1 gap-3">
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
        <h2 className="text-lg font-semibold text-gray-900">Immagine prodotto</h2>

        {getFieldError('images') && (
          <div className="text-sm text-red-600 mt-3 p-3 bg-red-50 rounded-md border border-red-200">
            {getFieldError('images')}
          </div>
        )}

        {/* Warning about image requirements */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-semibold text-amber-900 mb-2">⚠️ Requisiti per l'immagine</h3>
          <ul className="text-sm text-amber-800 space-y-1 leading-relaxed">
            <li>
              • <strong>Dimensioni:</strong> Max 200 KB (ottimizza prima dell'upload)
            </li>
            <li>
              • <strong>Formato:</strong> JPG, PNG o WEBP consigliati
            </li>
            <li>
              • <strong>Risoluzione:</strong> Min 800x800px, ottimale 1200x1200px
            </li>
            <li>
              • <strong>Nome file:</strong> Usa nomi descrittivi (es.
              "detersivo-piatti-lavanda-500ml.jpg")
            </li>
            <li>
              • <strong>Qualità:</strong> Sfondo bianco o trasparente, immagine nitida e ben
              illuminata
            </li>
          </ul>
        </div>

        <div className="mt-5">
          {draft.images.length === 0 ? (
            // No image yet - show upload button
            <button
              type="button"
              className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
              onClick={() =>
                setDraft((p) => ({
                  ...p,
                  images: [{ src: '', alt: '', publicId: undefined }],
                }))
              }
            >
              <div className="text-gray-600">
                <div className="text-4xl mb-2">📷</div>
                <div className="font-medium">Clicca per aggiungere un'immagine</div>
                <div className="text-sm mt-1">Carica un'immagine del prodotto</div>
              </div>
            </button>
          ) : (
            // Image exists - show editor
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="product_image_file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {draft.images[0].src ? 'Sostituisci immagine' : 'Carica immagine'}
                  </label>
                  <input
                    id="product_image_file"
                    type="file"
                    accept="image/*"
                    className={inputBase}
                    disabled={!!isUploadingImage[0]}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      void uploadProductImage(file, 0);
                      e.currentTarget.value = '';
                    }}
                  />
                  {draft.images[0].src ? (
                    <div className="mt-3">
                      <img
                        src={draft.images[0].src}
                        alt={draft.images[0].alt || 'Anteprima'}
                        className="max-h-60 rounded-md border border-black/5"
                      />
                      <div className="mt-2 text-xs text-gray-500 break-all">
                        {draft.images[0].src}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      Seleziona un file da caricare su Cloudinary
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product_image_alt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Alt text * (obbligatorio)
                  </label>
                  <textarea
                    id="product_image_alt"
                    value={draft.images[0].alt || ''}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        images: [{ ...p.images[0], alt: e.target.value }],
                      }))
                    }
                    className={inputBase}
                    rows={4}
                    placeholder="Es: Detersivo piatti ecologico Lavanda 500ml - bottiglia verde"
                    required
                  />
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-900 font-medium mb-1">
                      💡 Cos'è l'Alt text e come compilarlo:
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Descrive l'immagine per utenti non vedenti e motori di ricerca</li>
                      <li>• Includi: nome prodotto, formato/volume, caratteristiche visive</li>
                      <li>• Esempio: "Sapone liquido Marsiglia 1L bottiglia trasparente"</li>
                      <li>• Evita: "immagine", "foto", parole generiche</li>
                    </ul>
                  </div>
                </div>
              </div>

              {draft.images[0].src && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                    onClick={() => setDraft((p) => ({ ...p, images: [] }))}
                  >
                    ✕ Rimuovi immagine
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </AdminCard>

      <AdminCard className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">Varianti</h2>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          ID e Etichetta vengono generati automaticamente dal volume e unità (es. "500ml", "1l")
        </p>
        {getFieldError('variants') && (
          <div className="text-sm text-red-600 mb-3 p-3 bg-red-50 rounded-md border border-red-200">
            {getFieldError('variants')}
          </div>
        )}
        <div className="mt-4 space-y-4">
          {draft.variants.map((v, idx) => {
            // Auto-generate ID and label from volume and unit
            const autoId = v.volume && v.unit ? `${v.volume}${v.unit}` : `v${idx + 1}`;
            const autoLabel = v.volume && v.unit ? `${v.volume} ${v.unit}` : '';

            // Update if values changed
            if (v.id !== autoId || v.label !== autoLabel) {
              setTimeout(() => {
                setDraft((p) => ({
                  ...p,
                  variants: p.variants.map((it, i) =>
                    i === idx ? { ...it, id: autoId, label: autoLabel } : it,
                  ),
                }));
              }, 0);
            }

            return (
              <div key={idx} className="border border-black/5 rounded-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Display auto-generated values */}
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">ID variante:</span>{' '}
                        <span className="font-medium">{autoId || '(auto)'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Etichetta:</span>{' '}
                        <span className="font-medium">{autoLabel || '(auto)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Editable fields */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label
                        htmlFor={`variant_volume_${idx}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Volume *
                      </label>
                      <input
                        id={`variant_volume_${idx}`}
                        type="text"
                        value={v.volume ? String(v.volume) : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, volume: val ? Number(val) : 0 } : it,
                            ),
                          }));
                        }}
                        className={inputBase}
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`variant_unit_${idx}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Unità *
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

                    <div>
                      <label
                        htmlFor={`variant_price_${idx}`}
                        className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
                      >
                        Prezzo (EUR) *
                      </label>
                      <input
                        id={`variant_price_${idx}`}
                        type="text"
                        inputMode="decimal"
                        value={
                          typeof v.price === 'string' ? v.price : v.price ? String(v.price) : ''
                        }
                        onChange={(e) => {
                          let val = e.target.value;
                          // Allow numbers and dot only
                          val = val.replace(/[^0-9.]/g, '');
                          // Allow only one decimal point
                          const parts = val.split('.');
                          if (parts.length > 2) {
                            val = parts[0] + '.' + parts.slice(1).join('');
                          }
                          // Store as string during editing to preserve dots
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, price: val as any } : it,
                            ),
                          }));
                        }}
                        onBlur={(e) => {
                          // Convert to number on blur
                          const numVal = parseFloat(e.target.value) || 0;
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, price: numVal } : it,
                            ),
                          }));
                        }}
                        className={inputBase}
                        placeholder="5.99"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`variant_stock_${idx}`}
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Stock
                      </label>
                      <input
                        id={`variant_stock_${idx}`}
                        type="text"
                        value={v.stock ? String(v.stock) : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, stock: val ? Number(val) : 0 } : it,
                            ),
                          }));
                        }}
                        className={inputBase}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`variant_weightGrams_${idx}`}
                        className="block text-sm font-medium text-gray-700 mb-2 leading-relaxed"
                      >
                        Peso (grammi) *
                      </label>
                      <input
                        id={`variant_weightGrams_${idx}`}
                        type="text"
                        inputMode="decimal"
                        value={
                          typeof v.weightGrams === 'string'
                            ? v.weightGrams
                            : v.weightGrams
                              ? String(v.weightGrams)
                              : ''
                        }
                        onChange={(e) => {
                          let val = e.target.value;
                          // Allow numbers and dot only
                          val = val.replace(/[^0-9.]/g, '');
                          // Allow only one decimal point
                          const parts = val.split('.');
                          if (parts.length > 2) {
                            val = parts[0] + '.' + parts.slice(1).join('');
                          }
                          // Store as string during editing to preserve dots
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, weightGrams: val as any } : it,
                            ),
                          }));
                        }}
                        onBlur={(e) => {
                          // Convert to number on blur
                          const numVal = parseFloat(e.target.value) || 0;
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, weightGrams: numVal } : it,
                            ),
                          }));
                        }}
                        className={inputBase}
                        placeholder="500"
                      />
                    </div>

                    <label className="flex items-center gap-3">
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

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={v.isBestSeller ?? false}
                        onChange={(e) =>
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.map((it, i) =>
                              i === idx ? { ...it, isBestSeller: e.target.checked } : it,
                            ),
                          }))
                        }
                        aria-label="Best Seller"
                        title="Best Seller"
                      />
                      <span className="text-sm text-gray-700">Best Seller</span>
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            variants: p.variants.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        ✕ Rimuovi variante
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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
                      price: 0,
                      stock: 0,
                      isAvailable: true,
                      isBestSeller: false,
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
        <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-5">Sconti</h2>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!draft.discount}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  discount: e.target.checked
                    ? { type: 'percentage', value: 0, startAt: undefined, endAt: undefined }
                    : undefined,
                }))
              }
            />
            <span className="text-sm font-medium text-gray-700">Attiva sconto percentuale</span>
          </label>

          {draft.discount && (
            <>
              <div>
                <label
                  htmlFor="discount_value"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sconto percentuale (%)
                </label>
                <input
                  id="discount_value"
                  type="text"
                  value={draft.discount.value ? String(draft.discount.value) : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const num = val ? Math.min(Number(val), 100) : 0;
                    setDraft((p) => ({
                      ...p,
                      discount: p.discount ? { ...p.discount, value: num } : undefined,
                    }));
                  }}
                  className={inputBase}
                  placeholder="10"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Inserisci il valore percentuale (es. 10 per 10%)
                </div>
              </div>
              <div>
                <label
                  htmlFor="discount_startAt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data inizio (opzionale)
                </label>
                <input
                  id="discount_startAt"
                  type="date"
                  value={draft.discount.startAt || ''}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      discount: p.discount ? { ...p.discount, startAt: e.target.value } : undefined,
                    }))
                  }
                  className={inputBase}
                />
              </div>
              <div>
                <label
                  htmlFor="discount_endAt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data fine (opzionale)
                </label>
                <input
                  id="discount_endAt"
                  type="date"
                  value={draft.discount.endAt || ''}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      discount: p.discount ? { ...p.discount, endAt: e.target.value } : undefined,
                    }))
                  }
                  className={inputBase}
                />
              </div>
            </>
          )}
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
