import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import HeroBanner from '@/lib/db/models/HeroBanner';

export const GET = handleApi(async () => {
  await connectToDB();

  const allActive = await HeroBanner.find({ isActive: true })
    .sort({ sortOrder: 1, updatedAt: -1 })
    .lean();

  // Regola: mostrare i banner DB solo se attivi tra 3 e 10.
  // In caso contrario, la vetrina usa i banner di default (fallback).
  const banners = allActive.length >= 3 ? allActive.slice(0, 10) : [];

  return NextResponse.json({ success: true, banners });
});
