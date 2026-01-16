import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin, requireDeveloperOrSuperadmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import ContactSubmission from '@/lib/db/models/ContactSubmission';
import { z } from 'zod';

const patchSchema = z
  .object({
    status: z.enum(['new', 'resolved', 'rejected']).optional(),
  })
  .strict();

export const GET = handleApi(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireDeveloperOrSuperadmin();
    if (authError) return authError;

    await connectToDB();

    const { id } = await params;

    const item = await ContactSubmission.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
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
          error: 'Validazione fallita',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const updated = await ContactSubmission.findByIdAndUpdate(id, parsed.data, {
      new: true,
    }).lean();
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Non trovato' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  },
);
