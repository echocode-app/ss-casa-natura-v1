'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountLayout from '@/components/layout/User/AccountLayout';
import OrdersSection from '@/components/account/OrdersSection';
import { Order } from '@/types/user';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

export default function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const showSpinner = useSmoothLoading(isLoading || loading, 120, 220);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }

    const fetchOrders = async () => {
      try {
        const resOrders = await fetch('/api/users/me/orders', { credentials: 'include' });
        if (resOrders.ok) {
          const ordersData = await resOrders.json();
          setOrders(ordersData);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, isLoading, router]);

  if (showSpinner) {
    return <FullscreenSpinner />;
  }

  return (
    <AccountLayout>
      <OrdersSection orders={orders} />
    </AccountLayout>
  );
}
