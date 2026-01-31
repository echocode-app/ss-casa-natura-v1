import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import Inventory from '@/lib/db/models/Inventory';
import { z } from 'zod';

const updateSchema = z.object({
  variantId: z.string().min(1).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
});

export const PUT = handleApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdminSection('products');
    if (authError) return authError;

    await connectToDB();

    const body = await req.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
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

    const { id } = await params;
    const productId = id;
    const variantId = parsed.data.variantId ?? null;
    const update: any = {};
    if (typeof parsed.data.stock === 'number') update.stock = parsed.data.stock;
    if (typeof parsed.data.isAvailable === 'boolean') update.isAvailable = parsed.data.isAvailable;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, errorCode: 'NO_CHANGES', error: 'No changes provided' },
        { status: 400 },
      );
    }

    await Inventory.updateOne(
      { productId, variantId },
      { $set: update, $setOnInsert: { productId, variantId } },
      { upsert: true },
    );

    return NextResponse.json({ success: true });
  },
);

export const DELETE = handleApi(
  async (_req: Request, { params: _params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdminSection('products');
    if (authError) return authError;

    return NextResponse.json({ success: false, error: 'Not implemented' }, { status: 501 });
  },
);
