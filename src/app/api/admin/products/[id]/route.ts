import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const PUT = handleApi(async (req: Request, { params }: { params: { id: string } }) => {
  // TODO: Implement updating product
  const body = await req.json();
  return NextResponse.json({ id: params.id, ...body });
});

export const DELETE = handleApi(
  async (_req: Request, { params: _params }: { params: { id: string } }) => {
    // TODO: Implement deleting product
    return NextResponse.json({ message: 'Deleted' });
  },
);
