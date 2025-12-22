import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/utils/mailchimp';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

export const POST = handleApi(async (req: NextRequest) => {
  const { name, email } = await req.json();
  if (!name || !email) {
    log('error', 'Contact form validation failed');
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ');

  await subscribeToNewsletter(email, firstName, lastName);
  log('send', `Contact form submitted: ${email}`);

  return NextResponse.json({ success: true });
});
