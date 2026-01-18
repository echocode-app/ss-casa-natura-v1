import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // Cookie is set by handleApi when missing.
  return NextResponse.json({ ok: true });
});
