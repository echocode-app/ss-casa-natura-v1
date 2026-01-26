import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();
  const products = await applyInventoryToCatalogProducts({ includeArchived: false });

  return NextResponse.json({
    success: true,
    products: products.map((p) => ({
      productId: p.id,
      sku: p.sku,
      title: p.title,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      categoryIds: p.categoryIds,
      lineId: p.lineId,
      images: p.images,
      weightGrams: p.weightGrams,
      price: p.price,
      currency: p.currency,
      discount: p.discount,
      promoEligible: p.promoEligible,
      isEco: p.isEco,
      isNew: p.isNew,
      isBestSeller: p.isBestSeller,
      isSeasonal: p.isSeasonal,
      relatedProductIds: p.relatedProductIds,
      filters: p.filters,
      stock: p.stock,
      isAvailable: p.isAvailable,
      variants: (p.variants || []).map((v: any) => ({
        variantId: v.id,
        label: v.label,
        volume: v.volume,
        unit: v.unit,
        priceModifier: v.priceModifier,
        stock: v.stock,
        isAvailable: v.isAvailable,
      })),
    })),
  });
});

export const POST = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json().catch(() => ({}));
  return NextResponse.json(
    { success: false, error: 'Not implemented', details: body },
    { status: 501 },
  );
});
