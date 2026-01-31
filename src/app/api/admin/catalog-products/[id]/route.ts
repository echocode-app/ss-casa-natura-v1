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

const patchSchema = z
  .object({
    slug: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    shortDescription: z.string().max(300).optional().nullable(),
    description: z.string().min(1).optional(),
    categoryIds: z.array(z.string().min(1)).optional(),
    lineId: z.string().optional().nullable(),
    images: z
      .array(
        z.object({
          src: z
            .string()
            .min(1)
            .refine(
              (value) =>
                value.startsWith('https://res.cloudinary.com/') || value.startsWith('/images/'),
              {
                message: 'Image src must be a Cloudinary URL (or a legacy /images/ path)',
              },
            ),
          alt: z.string().optional(),
          publicId: z.string().optional(),
        }),
      )
      .optional(),
    variants: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1),
          volume: z.number().finite().nonnegative(),
          unit: z.enum(['ml', 'l', 'kg', 'g']),
          weightGrams: z.number().finite().nonnegative().optional(),
          price: z.number().finite().nonnegative().optional(),
          stock: z.number().int().min(0).optional(),
          isAvailable: z.boolean().optional(),
          isBestSeller: z.boolean().optional(),
        }),
      )
      .optional(),
    weightGrams: z.number().finite().nonnegative().optional(),
    price: z.number().finite().nonnegative().optional(),
    currency: z.literal('EUR').optional(),
    stock: z.number().int().min(0).optional(),
    isAvailable: z.boolean().optional(),
    discount: z
      .object({
        type: z.enum(['percentage', 'fixed']),
        value: z.number().finite().nonnegative(),
        startAt: z.string().optional(),
        endAt: z.string().optional(),
      })
      .nullable()
      .optional(),
    promoEligible: z.boolean().optional(),
    isEco: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isSeasonal: z.boolean().optional(),
    relatedProductIds: z.array(z.string().min(1)).optional(),
    filters: z
      .array(
        z.object({
          filterId: z.string().min(1),
          value: z.union([z.string(), z.number(), z.boolean()]),
        }),
      )
      .optional(),
    archived: z.boolean().optional(),
  })
  .strict();

export const GET = handleApi(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    await connectToDB();

    const { id } = await params;
    const doc = await CatalogProduct.findOne({ id }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: toApiProduct(doc) });
  },
);

export const PUT = handleApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    await connectToDB();

    const { id } = await params;

    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
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

    const update: any = { ...parsed.data };

    if (Object.prototype.hasOwnProperty.call(update, 'isNew')) {
      update.isNewProduct = update.isNew;
      delete update.isNew;
    }

    if (
      Object.prototype.hasOwnProperty.call(update, 'shortDescription') &&
      update.shortDescription === null
    ) {
      update.shortDescription = undefined;
    }
    if (Object.prototype.hasOwnProperty.call(update, 'lineId') && update.lineId === null) {
      update.lineId = undefined;
    }

    if (Object.prototype.hasOwnProperty.call(update, 'discount') && update.discount === null) {
      update.discount = undefined;
    }

    const updated = await CatalogProduct.findOneAndUpdate({ id }, update, {
      new: true,
      upsert: true,
    }).lean();

    return NextResponse.json({ success: true, product: toApiProduct(updated) });
  },
);

export const DELETE = handleApi(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    await connectToDB();

    const { id } = await params;

    const updated = await CatalogProduct.findOneAndUpdate(
      { id },
      { $set: { archived: true } },
      { new: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  },
);
