import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const PUT = handleApi(async (req: Request, { params }: { params: { id: string } }) => {
  // TODO: Implement updating order status
  const body = await req.json();
  return NextResponse.json({ id: params.id, ...body });
});
