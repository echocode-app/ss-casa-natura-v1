import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: Request) => {
  // TODO: Implement sending contact form via Mailchimp
  await req.json();
  return NextResponse.json({ message: 'Message sent' });
});
