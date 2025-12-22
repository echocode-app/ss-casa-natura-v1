import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import PromoCode, { IPromoCode } from '@/lib/db/models/PromoCode';
import { log } from '@/lib/utils/logger';
import { adminAuth } from '@/lib/utils/adminAuth';

const handler = async (req: NextRequest, _context: any) => {
  await connectToDB();
  log('server', 'Connected to DB');

  if (req.method === 'GET') {
    const codes = await PromoCode.find().lean<IPromoCode[]>();
    log('success', 'Fetched all promocodes');
    return NextResponse.json(codes);
  }

  if (req.method === 'POST') {
    const data: Partial<IPromoCode> = await req.json();
    const code = new PromoCode({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      usedCount: 0,
    });

    await code.save();

    log('success', `Promo code created: ${code.code}`);
    return NextResponse.json(code);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const GET = adminAuth(handler);
export const POST = adminAuth(handler);
