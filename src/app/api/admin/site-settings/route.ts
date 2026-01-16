import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import SiteSettings from '@/lib/db/models/SiteSettings';

const promoBarSchema = z
  .object({
    enabled: z.boolean().optional(),
    href: z.string().max(300).optional().nullable(),
    bgColor: z.string().max(30).optional().nullable(),
    textColor: z.string().max(30).optional().nullable(),
    textIt: z.string().max(300).optional().nullable(),
    textEn: z.string().max(300).optional().nullable(),
  })
  .strict();

const bodySchema = z
  .object({
    promoBar: promoBarSchema.optional(),
  })
  .strict();

function nullToUndefined<T extends Record<string, any>>(obj: T) {
  const copy: any = { ...obj };
  for (const [k, v] of Object.entries(copy)) {
    if (v === null) copy[k] = undefined;
  }
  return copy as T;
}

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const doc =
    (await SiteSettings.findOne({ key: 'default' }).lean()) ||
    (await SiteSettings.create({ key: 'default' }));

  return NextResponse.json({
    success: true,
    settings: {
      promoBar: doc.promoBar,
      globalPromotion: doc.globalPromotion,
      promoSubscription: doc.promoSubscription,
    },
  });
});

export const PUT = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
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

  const patch: any = {};
  if (parsed.data.promoBar) {
    patch.promoBar = nullToUndefined(parsed.data.promoBar);
  }

  const updated = await SiteSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: patch, $setOnInsert: { key: 'default' } },
    { new: true, upsert: true },
  ).lean();

  return NextResponse.json({
    success: true,
    settings: {
      promoBar: updated.promoBar,
      globalPromotion: updated.globalPromotion,
      promoSubscription: updated.promoSubscription,
    },
  });
});
