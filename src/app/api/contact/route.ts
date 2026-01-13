import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const POST = handleApi(async (req: NextRequest) => {
  // Rate limiting: 3 submissions per 15 minutes per IP
  if (!checkRateLimit(req, 3)) {
    return NextResponse.json(
      { error: 'Too many contact form submissions. Please try again later.' },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = contactSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { name, email, subject, message } = validation.data;

  // TODO: Integrate with email service (SendGrid, Mailchimp, etc.)
  // await sendContactEmail({ name, email, subject, message });

  return NextResponse.json({ message: 'Message sent successfully' });
});
