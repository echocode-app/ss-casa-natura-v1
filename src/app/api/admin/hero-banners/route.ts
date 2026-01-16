import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import HeroBanner from '@/lib/db/models/HeroBanner';
import { z } from 'zod';

const bannerSchema = z.object({
  image: z.string().min(1),
  title: z.string().max(120).optional(),
  text: z.string().max(300).optional(),
  href: z.string().max(300).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const banners = await HeroBanner.find({}).sort({ sortOrder: 1, updatedAt: -1 }).lean();
  return NextResponse.json({ success: true, banners });
});

export const POST = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const body = await req.json().catch(() => null);
  const parsed = bannerSchema.safeParse(body);
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

  const created = await HeroBanner.create(parsed.data);
  return NextResponse.json({ success: true, banner: created });
});
