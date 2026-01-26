import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import HeroBanner from '@/lib/db/models/HeroBanner';
import { destroyImage } from '@/lib/cloudinary/server';
import { z } from 'zod';

const patchSchema = z
  .object({
    image: z
      .string()
      .min(1)
      .refine(
        (value) => value.startsWith('https://res.cloudinary.com/') || value.startsWith('/images/'),
        { message: 'Image must be a Cloudinary URL (or a legacy /images/ path)' },
      )
      .optional(),
    imagePublicId: z.string().optional().nullable(),
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

    const existing = await HeroBanner.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Banner non trovato' }, { status: 404 });
    }

    // Verifica limite massimo di 6 banner attivi
    if (parsed.data.isActive === true && !(existing as any).isActive) {
      const activeCount = await HeroBanner.countDocuments({ isActive: true });
      if (activeCount >= 6) {
        return NextResponse.json(
          {
            success: false,
            errorCode: 'MAX_ACTIVE_BANNERS_REACHED',
            error:
              'Massimo 6 banner attivi consentiti. Disattiva un altro banner prima di attivare questo.',
          },
          { status: 400 },
        );
      }
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

    // If image changed and we have an old Cloudinary publicId, try to clean it up.
    const newPublicId = (updated as any)?.imagePublicId;
    const oldPublicId = (existing as any)?.imagePublicId;
    if (oldPublicId && newPublicId && oldPublicId !== newPublicId) {
      try {
        await destroyImage(oldPublicId);
      } catch {
        // best-effort
      }
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

    const publicId = (deleted as any)?.imagePublicId;
    if (publicId) {
      try {
        await destroyImage(publicId);
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ success: true });
  },
);
