import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import HeroBanner from '@/lib/db/models/HeroBanner';
import { z } from 'zod';

const patchSchema = z
  .object({
    image: z.string().min(1).optional(),
    title: z.string().max(120).optional().nullable(),
    text: z.string().max(300).optional().nullable(),
    cta: z.string().max(80).optional().nullable(),
    href: z.string().max(300).optional().nullable(),

    titleIt: z.string().max(120).optional().nullable(),
    subtitleIt: z.string().max(300).optional().nullable(),
    ctaIt: z.string().max(80).optional().nullable(),
    titleEn: z.string().max(120).optional().nullable(),
    subtitleEn: z.string().max(300).optional().nullable(),
    ctaEn: z.string().max(80).optional().nullable(),

    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .strict();

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
          error: 'Validazione fallita',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const update: any = { ...parsed.data };
    for (const key of [
      'title',
      'text',
      'cta',
      'href',
      'titleIt',
      'subtitleIt',
      'ctaIt',
      'titleEn',
      'subtitleEn',
      'ctaEn',
    ] as const) {
      if (Object.prototype.hasOwnProperty.call(update, key) && update[key] === null) {
        update[key] = undefined;
      }
    }

    const updated = await HeroBanner.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Banner non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner: updated });
  },
);

export const DELETE = handleApi(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    await connectToDB();

    const { id } = await params;

    const deleted = await HeroBanner.findByIdAndDelete(id).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Banner non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  },
);
