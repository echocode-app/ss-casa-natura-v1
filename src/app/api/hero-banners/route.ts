import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import HeroBanner from '@/lib/db/models/HeroBanner';

export const GET = handleApi(async () => {
  await connectToDB();

  const allActive = await HeroBanner.find({ isActive: true })
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean();

  // Return up to 6 active DB banners; otherwise UI falls back to defaults.
  const banners = allActive.length >= 1 ? allActive.slice(0, 6) : [];

  return NextResponse.json({ success: true, banners });
});
