import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import PromoCode from '@/lib/db/models/PromoCode';
import mongoose from 'mongoose';

export const GET = handleApi(async (req: Request) => {
  await connectToDB();

  const url = new URL(req.url);
  const shouldSeed = ['1', 'true', 'yes'].includes(
    (url.searchParams.get('seed') ?? '').toLowerCase(),
  );

  // Lightweight, non-mutating ping (no secrets in response)
  const admin = mongoose.connection?.db?.admin?.();
  const pingResult = admin ? await admin.ping() : null;
  const readyState = mongoose.connection?.readyState;
  const dbName = mongoose.connection?.db?.databaseName;

  if (!shouldSeed) {
    return NextResponse.json({
      ok: true,
      status: 'DB connected',
      details: {
        readyState,
        dbName,
        ping: pingResult,
      },
      note: 'Add ?seed=1 to upsert test promo codes (disabled by default).',
    });
  }

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_DB_SEED !== 'true') {
    return NextResponse.json(
      {
        ok: false,
        error: 'Seeding is disabled in production',
        hint: 'Set ALLOW_TEST_DB_SEED=true to allow ?seed=1',
      },
      { status: 403 },
    );
  }

  const testPromos = [
    {
      code: 'SAVE10',
      type: 'percentage' as const,
      value: 10,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
    },
    {
      code: 'FIXED5',
      type: 'fixed' as const,
      value: 5,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 50,
    },
  ];

  for (const promo of testPromos) {
    await PromoCode.findOneAndUpdate({ code: promo.code }, promo, { upsert: true, new: true });
  }

  return NextResponse.json({
    ok: true,
    status: 'DB connected + seeded',
    details: {
      readyState,
      dbName,
      ping: pingResult,
    },
    message: 'Test promo codes seeded: SAVE10 (10% off), FIXED5 (€5 off)',
  });
});
