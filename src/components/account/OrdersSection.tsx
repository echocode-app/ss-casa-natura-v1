'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { Order } from '@/types/user';
import CartEmpty from '@/components/ui/Сart/CartEmpty';
import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';
import OrderProductCard from './OrderProductCard';
import Spinner from '@/components/ui/Spinner/Spinner';

interface OrdersSectionProps {
  orders: Order[];
}

export default function OrdersSection({ orders }: OrdersSectionProps) {
  const t = useTranslations('user.account.orders');
  const locale = useLocale();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    return t(`statuses.${status}` as any) || status;
  };

  const toggleOrderDetails = (orderId: string) => {
    setLoadingOrders((prev) => new Set(prev).add(orderId));

    setTimeout(() => {
      setExpandedOrders((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(orderId)) {
          newSet.delete(orderId);
        } else {
          newSet.add(orderId);
        }
        return newSet;
      });

      setLoadingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }, 300);
  };

  const calculateOrderTotal = (order: Order) => {
    return order.products.reduce((sum: number, item) => {
      if (!item.product) return sum;
      return sum + item.product.price * item.quantity;
    }, 0);
  };

  if (orders.length === 0) {
    return (
      <div className="py-20">
        <CartEmpty onClose={() => {}} />
      </div>
    );
  }

  return (
    <section className="p-5 py-10 lg:py-14" aria-labelledby="orders-heading">
      <div className="flex flex-col gap-2 md:gap-4 ">
        {orders.map((order, index) => {
          const isExpanded = expandedOrders.has(order.id);
          const isLoading = loadingOrders.has(order.id);
          const orderTotal = order.totalPrice || calculateOrderTotal(order);

          return (
            <article
              key={order.id}
              className="rounded-[25px] overflow-hidden bg-background-grizzly transition-shadow hover:shadow-header"
            >
              {/* Order Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between 
              gap-2 px-3 py-6 lg:px-6 lg:py-9 
              font-semibold text-[clamp(16px,3vw,23px)]"
              >
                <h3 className=" ">{t('orderNumber', { number: index + 1 })}</h3>
                <span>{formatDate(order.createdAt)}</span>

                <div className="w-full sm:w-auto">
                  <PrimaryButton
                    onClick={() => toggleOrderDetails(order.id)}
                    className="min-w-[180px] lg:min-w-[290px] px-6 py-3 lg:py-6"
                    loading={isLoading}
                  >
                    {isExpanded ? t('hideDetails') : t('viewDetails')}
                  </PrimaryButton>
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {isExpanded && (
                <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">{t('status')}:</span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' || order.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Products */}
                  <div className="space-y-2">
                    {order.products.map((item, idx) => (
                      <OrderProductCard
                        key={`${order.id}-product-${idx}`}
                        product={item.product!}
                        quantity={item.quantity}
                      />
                    ))}
                  </div>

                  {/* Footer - Total */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center px-2 md:px-4">
                      <span className="font-semibold text-gray-700 text-base md:text-lg">
                        {t('totalWithVat')}
                      </span>
                      <span className="font-bold text-gray-900 text-lg md:text-xl">
                        € {orderTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && !isExpanded && (
                <div className="p-4 flex items-center justify-center">
                  <Spinner size="md" colorScheme="accent" />
                  <span className="ml-3 text-sm text-gray-600">{t('loading')}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
