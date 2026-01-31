import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import SiteSettings from '@/lib/db/models/SiteSettings';
import { PRODUCT_CATEGORIES } from '@/config/products/product.categories';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { PRODUCT_LINES } from '@/config/products/product.lines';

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

function getAllowedPromoLinks(): Set<string> {
  const allowed = new Set<string>();
  allowed.add('/prodotti');

  for (const cat of PRODUCT_CATEGORIES) {
    allowed.add(`/prodotti?subcategory=${cat.id}`);
  }
  for (const cat of PRODUCT_FILTERS) {
    allowed.add(`/prodotti?category=${cat.id}`);
  }
  for (const line of PRODUCT_LINES) {
    allowed.add(`/linee/${line.id}`);
  }

  return allowed;
}

export const GET = handleApi(async () => {
  const authError = await requireAdminSection('promotions');
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
  const authError = await requireAdminSection('promotions');
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
    const promoBar = nullToUndefined(parsed.data.promoBar);
    const hasItalianText = Boolean((promoBar.textIt || '').trim());
    const enabled = !!promoBar.enabled;
    const href = typeof promoBar.href === 'string' ? promoBar.href.trim() : '';

    if (enabled && !hasItalianText) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'PROMO_TEXT_REQUIRED',
          error: 'Testo (Italiano) obbligatorio per abilitare la PromoBar.',
        },
        { status: 400 },
      );
    }

    if (href) {
      const allowed = getAllowedPromoLinks();
      if (!allowed.has(href)) {
        return NextResponse.json(
          {
            success: false,
            errorCode: 'PROMO_LINK_INVALID',
            error: 'Link PromoBar non valido. Seleziona un link dalla lista.',
          },
          { status: 400 },
        );
      }
    }

    patch.promoBar = promoBar;
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
