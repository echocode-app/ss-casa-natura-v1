import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import HeroBanner from '@/lib/db/models/HeroBanner';

export const GET = handleApi(async () => {
  await connectToDB();

  const banners = await HeroBanner.find({ isActive: true })
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean();

  return NextResponse.json({ success: true, banners });
});
