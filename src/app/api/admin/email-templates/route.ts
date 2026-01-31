import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import SiteSettings from '@/lib/db/models/SiteSettings';

const templateSchema = z
  .object({
    welcomeText: z.string().max(8000).optional().nullable(),
    promoCodeText: z.string().max(8000).optional().nullable(),
    passwordResetText: z.string().max(8000).optional().nullable(),
    orderConfirmationText: z.string().max(8000).optional().nullable(),
    newOrderAdminText: z.string().max(8000).optional().nullable(),
  })
  .strict();

const bodySchema = z
  .object({
    emailTemplates: templateSchema,
  })
  .strict();

function normalizeText(value?: string | null) {
  if (value === null || value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export const GET = handleApi(async () => {
  const authError = await requireAdminSection('emails');
  if (authError) return authError;

  await connectToDB();

  const doc =
    (await SiteSettings.findOne({ key: 'default' }).lean()) ||
    (await SiteSettings.create({ key: 'default' }));

  return NextResponse.json({
    success: true,
    emailTemplates: doc.emailTemplates || {},
  });
});

export const PUT = handleApi(async (req: Request) => {
  const authError = await requireAdminSection('emails');
  if (authError) return authError;

  await connectToDB();

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validazione fallita',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const incoming = parsed.data.emailTemplates;
  const updates: Record<string, string | undefined> = {};

  if (Object.prototype.hasOwnProperty.call(incoming, 'welcomeText')) {
    updates['emailTemplates.welcomeText'] = normalizeText(incoming.welcomeText);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'promoCodeText')) {
    updates['emailTemplates.promoCodeText'] = normalizeText(incoming.promoCodeText);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'passwordResetText')) {
    updates['emailTemplates.passwordResetText'] = normalizeText(incoming.passwordResetText);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'orderConfirmationText')) {
    updates['emailTemplates.orderConfirmationText'] = normalizeText(incoming.orderConfirmationText);
  }
  if (Object.prototype.hasOwnProperty.call(incoming, 'newOrderAdminText')) {
    updates['emailTemplates.newOrderAdminText'] = normalizeText(incoming.newOrderAdminText);
  }

  const updated = await SiteSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: updates, $setOnInsert: { key: 'default' } },
    { new: true, upsert: true },
  ).lean();

  return NextResponse.json({
    success: true,
    emailTemplates: updated.emailTemplates || {},
  });
});
