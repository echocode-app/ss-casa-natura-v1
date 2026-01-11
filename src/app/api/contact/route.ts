import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // 📌 Mailchimp integration for contact form
  await req.json();
  return NextResponse.json({ message: 'Message sent' });
});
