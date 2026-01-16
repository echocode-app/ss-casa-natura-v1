'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminCard from '@/components/admin/AdminCard';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import notify from '@/lib/notify';
import CatalogProductForm, {
  type CatalogProductDraft,
} from '@/components/admin/products/CatalogProductForm';

function toDraftFromApi(productId: string, apiProduct: any | null): CatalogProductDraft {
  if (!apiProduct) {
    return {
      id: productId,
      slug: '',
      sku: '',
      title: '',
      shortDescription: '',
      description: '',
      categoryIds: [],
      lineId: '',
      images: [],
      variants: [],
      weightGrams: 0,
      price: 0,
      currency: 'EUR',
      stock: 0,
      isAvailable: true,
      promoEligible: true,
      isEco: false,
      isNew: false,
      isBestSeller: false,
      isSeasonal: false,
      relatedProductIds: [],
      archived: false,
    };
  }

  return {
    id: apiProduct.id || productId,
    slug: apiProduct.slug || '',
    sku: apiProduct.sku || '',
    title: apiProduct.title || '',
    shortDescription: apiProduct.shortDescription || '',
    description: apiProduct.description || '',
    categoryIds: apiProduct.categoryIds || [],
    lineId: apiProduct.lineId || '',
    images: apiProduct.images || [],
    variants: apiProduct.variants || [],
    weightGrams: apiProduct.weightGrams || 0,
    price: apiProduct.price || 0,
    currency: apiProduct.currency || 'EUR',
    stock: apiProduct.stock ?? 0,
    isAvailable: apiProduct.isAvailable ?? true,
    discount: apiProduct.discount,
    promoEligible: apiProduct.promoEligible,
    isEco: apiProduct.isEco,
    isNew: apiProduct.isNew,
    isBestSeller: apiProduct.isBestSeller,
    isSeasonal: apiProduct.isSeasonal,
    relatedProductIds: apiProduct.relatedProductIds || [],
    archived: apiProduct.archived || false,
  };
}

export default function AdminEditProductPage() {
  const params = useParams();
  const productId = useMemo(() => String((params as any)?.id || ''), [params]);

  const [draft, setDraft] = useState<CatalogProductDraft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/catalog-products/${encodeURIComponent(productId)}`, {
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 404) {
          setNotFound(true);
          setDraft(toDraftFromApi(productId, null));
          return;
        }

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Caricamento fallito');
        }

        setDraft(toDraftFromApi(productId, data.product));
        setNotFound(false);
      } catch (e: any) {
        notify.error(e?.message || 'Caricamento fallito');
        setDraft(toDraftFromApi(productId, null));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [productId]);

  if (!productId) {
    return <div className="text-gray-600">ID prodotto mancante.</div>;
  }

  if (isLoading || !draft) {
    return (
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Prodotto</h1>
        <div className="mt-4 text-gray-600">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {notFound && (
        <AdminCard className="p-5 border border-amber-200 bg-amber-50">
          <div className="text-sm text-amber-900">
            Questo prodotto non esiste ancora in DB. Salvando, creerai un override DB per l'ID{' '}
            <b>{productId}</b>.
          </div>
          <div className="mt-3">
            <PrimaryButton
              className="px-5 py-2"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Vai alla sezione Salva
            </PrimaryButton>
          </div>
        </AdminCard>
      )}

      <CatalogProductForm mode="edit" initial={draft} />
    </div>
  );
}
