// Simple Order type for now
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
}

export async function fetchUserOrders(useMock: boolean = false): Promise<Order[]> {
  if (useMock) {
    // Mock data
    return [
      {
        id: 'order-1',
        items: [{ productId: 'prod-001', quantity: 2, price: 5.5 }],
        total: 11,
        status: 'paid',
      },
    ];
  }

  const res = await fetch('/api/users/me/orders');
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}
