import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { z } from 'zod';
import { contactSchema } from '@/lib/validation/schemas';

const legacyContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export const POST = handleApi(async (req: NextRequest) => {
  // Rate limiting: 3 submissions per 15 minutes per IP
  if (!checkRateLimit(req, 3)) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'RATE_LIMIT',
        error: 'Rate limit exceeded',
      },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'INVALID_JSON',
        error: 'Invalid JSON',
      },
      { status: 400 },
    );
  }

  const v2 = contactSchema.safeParse(body);
  if (v2.success) {
    const normalized = {
      name: `${v2.data.nome} ${v2.data.cognome}`.trim(),
      email: v2.data.email,
      subject: 'Contatti',
      message: v2.data.messaggio,
      phone: v2.data.telefono || undefined,
    };

    // TODO: Integrate with email service (SendGrid, Mailchimp, etc.)
    // await sendContactEmail(normalized);
    void normalized;

    return NextResponse.json({ success: true });
  }

  const legacy = legacyContactSchema.safeParse(body);
  if (!legacy.success) {
    const errors = v2.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        error: 'Validation failed',
        details: errors,
      },
      { status: 400 },
    );
  }

  const normalized = {
    name: legacy.data.name,
    email: legacy.data.email,
    subject: legacy.data.subject,
    message: legacy.data.message,
    phone: undefined,
  };

  // TODO: Integrate with email service (SendGrid, Mailchimp, etc.)
  // await sendContactEmail(normalized);
  void normalized;

  return NextResponse.json({ success: true });
});
