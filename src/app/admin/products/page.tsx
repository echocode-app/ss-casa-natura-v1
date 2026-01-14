'use client';

import { useEffect, useMemo, useState } from 'react';
import { getCsrfHeaders } from '@/lib/utils/csrfClient';
import notify from '@/lib/notify';

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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Prodotti</h1>
        <div className="text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prodotti</h1>
          <p className="text-gray-600 mt-1">
            Gestisci disponibilità e stock (catalogo mock + inventory DB)
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
        >
          Aggiorna
        </button>
      </div>

      <div className="mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per titolo, SKU o slug…"
          className="w-full max-w-xl px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="space-y-6">
        {filtered.map((p) => (
          <div key={p.productId} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">{p.title}</div>
                <div className="text-sm text-gray-600 mt-1">
                  SKU: {p.sku} · Slug: {p.slug} · ID: {p.productId}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700">Disponibile</label>
                <input
                  type="checkbox"
                  defaultChecked={p.isAvailable ?? true}
                  onChange={(e) => saveRow(p.productId, null, { isAvailable: e.target.checked })}
                />

                <label className="text-sm text-gray-700 ml-3">Stock</label>
                <input
                  type="number"
                  min={0}
                  defaultValue={p.stock ?? 0}
                  className="w-24 px-2 py-1 border border-gray-300 rounded"
                  onBlur={(e) => saveRow(p.productId, null, { stock: Number(e.target.value || 0) })}
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
                    <tr key={v.variantId} className="border-t border-gray-100">
                      <td className="py-2">
                        {v.label} <span className="text-gray-500">({v.variantId})</span>
                      </td>
                      <td className="py-2">
                        <input
                          type="checkbox"
                          defaultChecked={v.isAvailable ?? true}
                          onChange={(e) =>
                            saveRow(p.productId, v.variantId, { isAvailable: e.target.checked })
                          }
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min={0}
                          defaultValue={v.stock ?? 0}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          onBlur={(e) =>
                            saveRow(p.productId, v.variantId, {
                              stock: Number(e.target.value || 0),
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="text-gray-600">Nessun prodotto trovato.</div>}
      </div>
    </div>
  );
}
