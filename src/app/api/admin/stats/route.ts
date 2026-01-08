import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // TODO: Implement fetching stats from DB
  return NextResponse.json({ totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
});
