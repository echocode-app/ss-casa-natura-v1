import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import CatalogProduct from '@/lib/db/models/CatalogProduct';
import { z } from 'zod';

function toApiProduct(doc: any) {
  const { isNewProduct, isNew, ...rest } = doc || {};
  return {
    ...rest,
    isNew: isNewProduct ?? isNew,
  };
}

const variantSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  volume: z.number().finite().nonnegative(),
  unit: z.enum(['ml', 'l', 'kg', 'g']),
  priceModifier: z.number().finite().optional(),
  stock: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

const imageSchema = z.object({
  src: z
    .string()
    .min(1)
    .refine(
      (value) => value.startsWith('https://res.cloudinary.com/') || value.startsWith('/images/'),
      {
        message: 'Image src must be a Cloudinary URL (or a legacy /images/ path)',
      },
    ),
  alt: z.string().optional(),
  publicId: z.string().optional(),
});

const discountSchema = z
  .object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().finite().nonnegative(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
  })
  .optional();

const filterValueSchema = z.object({
  filterId: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

const productSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(1),
  categoryIds: z.array(z.string().min(1)).default([]),
  lineId: z.string().optional(),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  weightGrams: z.number().finite().nonnegative(),
  price: z.number().finite().nonnegative(),
  currency: z.literal('EUR').default('EUR'),
  stock: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  discount: discountSchema,
  promoEligible: z.boolean().optional(),
  isEco: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isSeasonal: z.boolean().optional(),
  relatedProductIds: z.array(z.string().min(1)).optional(),
  filters: z.array(filterValueSchema).optional(),
});

export const GET = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const url = new URL(req.url);
  const includeArchived = url.searchParams.get('includeArchived') === '1';
  const q = (url.searchParams.get('q') || '').trim();

  const query: any = includeArchived ? {} : { archived: { $ne: true } };
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { slug: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { id: { $regex: q, $options: 'i' } },
    ];
  }

  const docs = await CatalogProduct.find(query).sort({ updatedAt: -1 }).lean();

  return NextResponse.json({ success: true, products: docs.map(toApiProduct) });
});

export const POST = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { isNew, ...rest } = parsed.data;
  const created = await CatalogProduct.create({
    ...rest,
    ...(isNew !== undefined ? { isNewProduct: isNew } : {}),
    archived: false,
  });

  return NextResponse.json({ success: true, product: toApiProduct(created.toObject()) });
});
