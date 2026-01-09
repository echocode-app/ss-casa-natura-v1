import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import PromoCode from '@/lib/db/models/PromoCode';

export const GET = handleApi(async () => {
  // Test actual DB connection
  await connectToDB();

  // Seed some test promo codes
  const testPromos = [
    {
      code: 'SAVE10',
      type: 'percentage' as const,
      value: 10,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 100,
    },
    {
      code: 'FIXED5',
      type: 'fixed' as const,
      value: 5,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      usageLimit: 50,
    },
  ];

  for (const promo of testPromos) {
    await PromoCode.findOneAndUpdate({ code: promo.code }, promo, { upsert: true, new: true });
  }

  return NextResponse.json({
    status: 'DB connected successfully',
    message: 'Test promo codes seeded: SAVE10 (10% off), FIXED5 (€5 off)',
  });
});
