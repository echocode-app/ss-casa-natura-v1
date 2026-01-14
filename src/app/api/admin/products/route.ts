import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import { applyInventoryToMockProducts } from '@/lib/utils/inventory';

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();
  const products = await applyInventoryToMockProducts();

  return NextResponse.json({
    success: true,
    products: products.map((p) => ({
      productId: p.id,
      sku: p.sku,
      title: p.title,
      slug: p.slug,
      stock: p.stock,
      isAvailable: p.isAvailable,
      variants: (p.variants || []).map((v) => ({
        variantId: v.id,
        label: v.label,
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
