import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const PUT = handleApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await req.json();
    return NextResponse.json({ id, ...body });
  },
);

export const DELETE = handleApi(
  async (_req: Request, { params: _params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireAdmin();
    if (authError) return authError;

    return NextResponse.json({ message: 'Deleted' });
  },
);
