'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import { PRODUCT_LINES } from '@/config/products/product.lines';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';

type HeroBanner = {
  _id: string;
  image: string;
  href?: string;
  isActive: boolean;
  sortOrder: number;
  title?: string;
  text?: string;
  cta?: string;
  titleIt?: string;
  subtitleIt?: string;
  ctaIt?: string;
  titleEn?: string;
  subtitleEn?: string;
  ctaEn?: string;
  updatedAt?: string;
};

const inputBase = 'w-full px-3 py-2 border border-gray-300 rounded-md';

function buildHrefFromLine(lineId: string) {
  // PRODUCT_LINES usa id come slug per /linee/[slug]
  const slug = PRODUCT_LINES.find((l) => l.id === lineId)?.id || lineId;
  return `/linee/${encodeURIComponent(slug)}`;
}

function buildHrefFromCategorySegment(segmentId: string) {
  return `/prodotti?category=${encodeURIComponent(segmentId)}`;
}

function buildHrefFromSubcategory(categoryId: string) {
  return `/prodotti?subcategory=${encodeURIComponent(categoryId)}`;
}

function normalizeText(value: string) {
  const v = value.trim();
  return v.length ? v : undefined;
}

export default function AdminBannersPage() {
  const [items, setItems] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);

  const [newBanner, setNewBanner] = useState<Partial<HeroBanner>>({
    image: '',
    isActive: true,
    sortOrder: 0,
    href: '/prodotti',
    titleIt: '',
    subtitleIt: '',
    ctaIt: 'Scopri di più',
    titleEn: '',
    subtitleEn: '',
    ctaEn: 'Learn more',
  });

  const activeCount = useMemo(() => items.filter((b) => b.isActive).length, [items]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/hero-banners', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.error || 'Impossibile caricare i banner');
      setItems(Array.isArray(data?.banners) ? data.banners : []);
    } catch (e: any) {
      notify.error(e?.message || 'Impossibile caricare i banner');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (banner: HeroBanner) => {
    setIsSaving((p) => ({ ...p, [banner._id]: true }));
    try {
      const payload = {
        image: banner.image,
        href: normalizeText(banner.href || '') ?? null,
        isActive: !!banner.isActive,
        sortOrder: Number.isFinite(Number(banner.sortOrder)) ? Number(banner.sortOrder) : 0,
        titleIt: normalizeText(banner.titleIt || '') ?? null,
        subtitleIt: normalizeText(banner.subtitleIt || '') ?? null,
        ctaIt: normalizeText(banner.ctaIt || '') ?? null,
        titleEn: normalizeText(banner.titleEn || '') ?? null,
        subtitleEn: normalizeText(banner.subtitleEn || '') ?? null,
        ctaEn: normalizeText(banner.ctaEn || '') ?? null,
      };

      const res = await fetch(`/api/admin/hero-banners/${encodeURIComponent(banner._id)}`, {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Salvataggio fallito');

      notify.success('Salvato');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Salvataggio fallito');
    } finally {
      setIsSaving((p) => ({ ...p, [banner._id]: false }));
    }
  };

  const remove = async (id: string) => {
    const ok = window.confirm('Eliminare questo banner?');
    if (!ok) return;

    setIsDeleting((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/admin/hero-banners/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getCsrfHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Eliminazione fallita');

      notify.success('Eliminato');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Eliminazione fallita');
    } finally {
      setIsDeleting((p) => ({ ...p, [id]: false }));
    }
  };

  const create = async () => {
    if (!newBanner.image?.trim()) {
      notify.error("L'immagine è obbligatoria.");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        image: newBanner.image.trim(),
        href: normalizeText(newBanner.href || '') ?? null,
        isActive: !!newBanner.isActive,
        sortOrder: Number.isFinite(Number(newBanner.sortOrder)) ? Number(newBanner.sortOrder) : 0,
        titleIt: normalizeText(newBanner.titleIt || '') ?? null,
        subtitleIt: normalizeText(newBanner.subtitleIt || '') ?? null,
        ctaIt: normalizeText(newBanner.ctaIt || '') ?? null,
        titleEn: normalizeText(newBanner.titleEn || '') ?? null,
        subtitleEn: normalizeText(newBanner.subtitleEn || '') ?? null,
        ctaEn: normalizeText(newBanner.ctaEn || '') ?? null,
      };

      const res = await fetch('/api/admin/hero-banners', {
        method: 'POST',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Creazione fallita');

      notify.success('Creato');
      setNewBanner((p) => ({
        ...p,
        image: '',
        titleIt: '',
        subtitleIt: '',
        titleEn: '',
        subtitleEn: '',
      }));
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Creazione fallita');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Banner Hero</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Banner Hero</h1>
          <p className="text-gray-600 mt-1">
            Slide attive: <span className="font-semibold">{activeCount}</span> (consigliato 3–10)
          </p>
        </div>

        <div className="flex gap-2">
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Aggiorna
          </PrimaryButton>
        </div>
      </div>

      <AdminCard className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="font-semibold">Nuovo banner</div>
            <PrimaryButton className="px-6 py-3 text-base" onClick={create} disabled={isCreating}>
              {isCreating ? 'Creazione…' : 'Crea'}
            </PrimaryButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new_banner_image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Immagine (URL) *
              </label>
              <input
                id="new_banner_image"
                value={String(newBanner.image || '')}
                onChange={(e) => setNewBanner((p) => ({ ...p, image: e.target.value }))}
                placeholder="/images/pages/lavanda-baner.jpg oppure https://..."
                className={inputBase}
              />
            </div>
            <div>
              <label
                htmlFor="new_banner_href"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Href
              </label>
              <input
                id="new_banner_href"
                value={String(newBanner.href || '')}
                onChange={(e) => setNewBanner((p) => ({ ...p, href: e.target.value }))}
                placeholder="/linee/lavanda o /prodotti?category=..."
                className={inputBase}
              />
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                <select
                  className={inputBase}
                  defaultValue=""
                  aria-label="Link a linea"
                  title="Link a linea"
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    setNewBanner((p) => ({ ...p, href: buildHrefFromLine(v) }));
                    e.target.value = '';
                  }}
                >
                  <option value="">Link a linea…</option>
                  {PRODUCT_LINES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>

                <select
                  className={inputBase}
                  defaultValue=""
                  aria-label="Link a sezione"
                  title="Link a sezione"
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    setNewBanner((p) => ({ ...p, href: buildHrefFromCategorySegment(v) }));
                    e.target.value = '';
                  }}
                >
                  <option value="">Link a sezione…</option>
                  {PRODUCT_FILTERS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>

                <select
                  className={inputBase}
                  defaultValue=""
                  aria-label="Link a sottocategoria"
                  title="Link a sottocategoria"
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    setNewBanner((p) => ({ ...p, href: buildHrefFromSubcategory(v) }));
                    e.target.value = '';
                  }}
                >
                  <option value="">Link a sottocategoria…</option>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AdminCard className="p-4">
              <div className="font-semibold">Italiano</div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <input
                  value={String(newBanner.titleIt || '')}
                  onChange={(e) => setNewBanner((p) => ({ ...p, titleIt: e.target.value }))}
                  placeholder="Titolo (IT)"
                  className={inputBase}
                />
                <input
                  value={String(newBanner.subtitleIt || '')}
                  onChange={(e) => setNewBanner((p) => ({ ...p, subtitleIt: e.target.value }))}
                  placeholder="Sottotitolo (IT)"
                  className={inputBase}
                />
                <input
                  value={String(newBanner.ctaIt || '')}
                  onChange={(e) => setNewBanner((p) => ({ ...p, ctaIt: e.target.value }))}
                  placeholder="Testo bottone (IT)"
                  className={inputBase}
                />
              </div>
            </AdminCard>

            <AdminCard className="p-4">
              <div className="font-semibold">English</div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <input
                  value={String(newBanner.titleEn || '')}
                  onChange={(e) => setNewBanner((p) => ({ ...p, titleEn: e.target.value }))}
                  placeholder="Title (EN)"
                  className={inputBase}
                />
                <input
                  value={String(newBanner.subtitleEn || '')}
                  onChange={(e) => setNewBanner((p) => ({ ...p, subtitleEn: e.target.value }))}
                  placeholder="Subtitle (EN)"
                  className={inputBase}
                />
                <input
                  value={String(newBanner.ctaEn || '')}
                  onChange={(e) => setNewBanner((p) => ({ ...p, ctaEn: e.target.value }))}
                  placeholder="Button text (EN)"
                  className={inputBase}
                />
              </div>
            </AdminCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!newBanner.isActive}
                onChange={(e) => setNewBanner((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Attivo
            </label>

            <div>
              <label
                htmlFor="new_banner_sort_order"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ordine
              </label>
              <input
                id="new_banner_sort_order"
                type="number"
                min={0}
                value={Number(newBanner.sortOrder || 0)}
                onChange={(e) => setNewBanner((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                className={inputBase}
              />
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="space-y-4">
        {items.length === 0 ? (
          <AdminCard className="p-5">
            <div className="text-gray-700">Nessun banner trovato.</div>
            <div className="text-sm text-gray-600 mt-1">
              Se non ci sono almeno 3 banner attivi, in home verranno mostrati i banner di default.
            </div>
          </AdminCard>
        ) : null}

        {items.map((b) => (
          <AdminCard key={b._id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-gray-600 break-words">ID: {b._id}</div>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  <div>
                    <label
                      htmlFor={`banner_${b._id}_image`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Immagine (URL)
                    </label>
                    <input
                      id={`banner_${b._id}_image`}
                      value={b.image}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) => (x._id === b._id ? { ...x, image: e.target.value } : x)),
                        )
                      }
                      placeholder="/images/... oppure https://..."
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`banner_${b._id}_href`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Href
                    </label>
                    <input
                      id={`banner_${b._id}_href`}
                      value={b.href || ''}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) => (x._id === b._id ? { ...x, href: e.target.value } : x)),
                        )
                      }
                      placeholder="/linee/... o /prodotti?..."
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <PrimaryButton
                  className="px-6 py-3 text-base"
                  onClick={() => save(b)}
                  disabled={!!isSaving[b._id]}
                >
                  {isSaving[b._id] ? 'Salvataggio…' : 'Salva'}
                </PrimaryButton>
                <PrimaryButton
                  className="px-6 py-3 text-base bg-red-600 hover:bg-red-700"
                  onClick={() => remove(b._id)}
                  disabled={!!isDeleting[b._id]}
                >
                  {isDeleting[b._id] ? 'Eliminazione…' : 'Elimina'}
                </PrimaryButton>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AdminCard className="p-4">
                <div className="font-semibold">Italiano</div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <input
                    value={b.titleIt ?? b.title ?? ''}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x._id === b._id ? { ...x, titleIt: e.target.value } : x)),
                      )
                    }
                    placeholder="Titolo (IT)"
                    className={inputBase}
                  />
                  <input
                    value={b.subtitleIt ?? b.text ?? ''}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x._id === b._id ? { ...x, subtitleIt: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Sottotitolo (IT)"
                    className={inputBase}
                  />
                  <input
                    value={b.ctaIt ?? b.cta ?? 'Scopri di più'}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x._id === b._id ? { ...x, ctaIt: e.target.value } : x)),
                      )
                    }
                    placeholder="Testo bottone (IT)"
                    className={inputBase}
                  />
                </div>
              </AdminCard>

              <AdminCard className="p-4">
                <div className="font-semibold">English</div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <input
                    value={b.titleEn ?? ''}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x._id === b._id ? { ...x, titleEn: e.target.value } : x)),
                      )
                    }
                    placeholder="Title (EN)"
                    className={inputBase}
                  />
                  <input
                    value={b.subtitleEn ?? ''}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x._id === b._id ? { ...x, subtitleEn: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Subtitle (EN)"
                    className={inputBase}
                  />
                  <input
                    value={b.ctaEn ?? ''}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) => (x._id === b._id ? { ...x, ctaEn: e.target.value } : x)),
                      )
                    }
                    placeholder="Button text (EN)"
                    className={inputBase}
                  />
                </div>
              </AdminCard>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!b.isActive}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) => (x._id === b._id ? { ...x, isActive: e.target.checked } : x)),
                    )
                  }
                />
                Attivo
              </label>

              <div>
                <label
                  htmlFor={`banner_${b._id}_sort_order`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Ordine
                </label>
                <input
                  id={`banner_${b._id}_sort_order`}
                  type="number"
                  min={0}
                  value={Number(b.sortOrder || 0)}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((x) =>
                        x._id === b._id ? { ...x, sortOrder: Number(e.target.value) } : x,
                      ),
                    )
                  }
                  className={inputBase}
                />
              </div>

              <div className="text-sm text-gray-600 flex items-end">
                {b.updatedAt ? `Aggiornato: ${new Date(b.updatedAt).toLocaleString('it-IT')}` : ''}
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
