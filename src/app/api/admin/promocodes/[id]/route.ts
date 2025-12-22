import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import PromoCode from '@/lib/db/models/PromoCode';
import { log } from '@/lib/utils/logger';
import { adminAuth } from '@/lib/utils/adminAuth';

const handler = async (req: NextRequest, context: any) => {
  const { id } = context.params;
  await connectToDB();
  log('server', 'Connected to DB');

  if (req.method === 'PUT') {
    const data = await req.json();
    const code = await PromoCode.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true },
    );
    if (!code) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    log('success', `Promo code updated: ${code.code}`);
    return NextResponse.json(code);
  }

  if (req.method === 'DELETE') {
    const code = await PromoCode.findByIdAndDelete(id);
    if (!code) return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    log('success', `Promo code deleted: ${code.code}`);
    return NextResponse.json({ message: 'Deleted' });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const PUT = adminAuth(handler);
export const DELETE = adminAuth(handler);
