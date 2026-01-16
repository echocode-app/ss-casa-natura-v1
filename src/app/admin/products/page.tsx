'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import notify from '@/lib/notify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

type AdminVariant = {
  variantId: string;
  label: string;
  stock?: number;
  isAvailable?: boolean;
};

type AdminProduct = {
  productId: string;
  sku: string;
  title: string;
  slug: string;
  stock?: number;
  isAvailable?: boolean;
  variants: AdminVariant[];
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [products, query]);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load products');
      }
      setProducts(data.products || []);
    } catch (e: any) {
      notify.error(e?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveRow = async (productId: string, variantId: string | null, patch: any) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: getCsrfHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: JSON.stringify({ variantId, ...patch }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save');
      }
      notify.success('Salvato');
      await load();
    } catch (e: any) {
      notify.error(e?.message || 'Failed to save');
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Prodotti</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Prodotti</h1>
          <p className="text-gray-600 mt-1">Catalogo + inventario (stock e disponibilità)</p>
        </div>

        <div className="flex gap-2">
          <PrimaryButton
            className="px-6 py-3 text-base"
            onClick={() => router.push('/admin/products/new')}
          >
            Nuovo prodotto
          </PrimaryButton>
          <PrimaryButton className="px-6 py-3 text-base" onClick={load}>
            Aggiorna
          </PrimaryButton>
        </div>
      </div>

      <AdminCard className="p-5">
        <label htmlFor="products_search" className="block text-sm font-medium text-gray-700 mb-2">
          Cerca
        </label>
        <input
          id="products_search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per titolo, SKU o slug…"
          className="w-full max-w-xl px-3 py-2 border border-gray-300 rounded-md"
        />
      </AdminCard>

      <div className="space-y-4">
        {filtered.map((p) => (
          <AdminCard key={p.productId} className="p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="min-w-0">
                <div className="text-lg font-semibold text-gray-900 truncate">{p.title}</div>
                <div className="text-sm text-gray-600 mt-1 break-words">
                  SKU: {p.sku} · Slug: {p.slug} · ID: {p.productId}
                </div>
                <div className="mt-3">
                  <Link
                    href={`/admin/products/${p.productId}`}
                    className="text-blue-700 hover:underline"
                  >
                    Modifica dettagli →
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    defaultChecked={p.isAvailable ?? true}
                    onChange={(e) => saveRow(p.productId, null, { isAvailable: e.target.checked })}
                    aria-label="Disponibile (prodotto)"
                    title="Disponibile (prodotto)"
                  />
                  Disponibile
                </label>

                <label htmlFor={`stock_${p.productId}`} className="text-sm text-gray-700 ml-3">
                  Stock
                </label>
                <input
                  id={`stock_${p.productId}`}
                  type="number"
                  min={0}
                  defaultValue={p.stock ?? 0}
                  className="w-24 px-2 py-1 border border-gray-300 rounded"
                  onBlur={(e) =>
                    saveRow(p.productId, null, {
                      stock: Number((e.target as HTMLInputElement).value || 0),
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2">Variante</th>
                    <th className="py-2">Disponibile</th>
                    <th className="py-2">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v) => (
                    <tr key={v.variantId} className="border-t border-black/5">
                      <td className="py-2">
                        {v.label} <span className="text-gray-500">({v.variantId})</span>
                      </td>
                      <td className="py-2">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={v.isAvailable ?? true}
                            onChange={(e) =>
                              saveRow(p.productId, v.variantId, { isAvailable: e.target.checked })
                            }
                            aria-label={`Disponibile variante ${v.variantId}`}
                            title={`Disponibile variante ${v.variantId}`}
                          />
                          <span className="sr-only">Disponibile</span>
                        </label>
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          defaultValue={v.stock ?? 0}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          onBlur={(e) =>
                            saveRow(p.productId, v.variantId, {
                              stock: Number((e.target as HTMLInputElement).value || 0),
                            })
                          }
                          aria-label={`Stock variante ${v.variantId}`}
                          title={`Stock variante ${v.variantId}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        ))}

        {filtered.length === 0 && <div className="text-gray-600">Nessun prodotto trovato.</div>}
      </div>
    </div>
  );
}
