import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const PUT = handleApi(async (req: Request, { params }: { params: { id: string } }) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json();
  return NextResponse.json({ id: params.id, ...body });
});

export const DELETE = handleApi(
  async (_req: Request, { params: _params }: { params: { id: string } }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    return NextResponse.json({ message: 'Deleted' });
  },
);
