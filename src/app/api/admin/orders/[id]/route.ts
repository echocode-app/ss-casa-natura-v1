import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import { z } from 'zod';

const schema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'canceled']).optional(),
});

export const PUT = handleApi(async (req: Request, { params }: { params: { id: string } }) => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: first?.message || 'Validation failed' },
      { status: 400 },
    );
  }

  const updated = await Order.findByIdAndUpdate(params.id, parsed.data, { new: true }).lean();
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, order: updated });
});
