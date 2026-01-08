import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(async () => {
  // Mock for now
  const orders = [
    {
      id: 'order-1',
      items: [{ productId: 'prod-001', quantity: 2, price: 5.5 }],
      total: 11,
      status: 'paid',
    },
  ];
  return NextResponse.json(orders);
});
