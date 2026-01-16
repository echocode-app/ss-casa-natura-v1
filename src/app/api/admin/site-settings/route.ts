import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import SiteSettings from '@/lib/db/models/SiteSettings';
import { z } from 'zod';

const promoBarSchema = z
  .object({
    enabled: z.boolean().optional(),
    text: z.string().max(300).optional().nullable(),
    href: z.string().max(300).optional().nullable(),
    bgColor: z.string().max(32).optional().nullable(),
    textColor: z.string().max(32).optional().nullable(),
  })
  .partial();

const globalPromotionSchema = z
  .object({
    enabled: z.boolean().optional(),
    percent: z.number().finite().min(0).max(100).optional(),
    scope: z.enum(['all', 'selected']).optional(),
    productIds: z.array(z.string().min(1)).optional(),
    bannerEnabled: z.boolean().optional(),
    bannerText: z.string().max(300).optional().nullable(),
    bannerBgColor: z.string().max(32).optional().nullable(),
    bannerTextColor: z.string().max(32).optional().nullable(),
  })
  .partial();

const promoSubscriptionSchema = z
  .object({
    enabled: z.boolean().optional(),
  })
  .partial();

const patchSchema = z
  .object({
    promoBar: promoBarSchema.optional(),
    globalPromotion: globalPromotionSchema.optional(),
    promoSubscription: promoSubscriptionSchema.optional(),
  })
  .strict();

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const doc =
    (await SiteSettings.findOne({ key: 'default' }).lean()) ||
    (await SiteSettings.create({ key: 'default' }));

  return NextResponse.json({ success: true, settings: doc });
});

export const PUT = handleApi(async (req: Request) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

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

  const update: any = {};
  const p = parsed.data;

  function normalizeNullable(obj: any) {
    const out: any = {};
    for (const [k, v] of Object.entries(obj || {})) {
      out[k] = v === null ? undefined : v;
    }
    return out;
  }

  if (p.promoBar) update.promoBar = normalizeNullable(p.promoBar);
  if (p.globalPromotion) update.globalPromotion = normalizeNullable(p.globalPromotion);
  if (p.promoSubscription) update.promoSubscription = normalizeNullable(p.promoSubscription);

  const doc = await SiteSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: update, $setOnInsert: { key: 'default' } },
    { new: true, upsert: true },
  ).lean();

  return NextResponse.json({ success: true, settings: doc });
});
