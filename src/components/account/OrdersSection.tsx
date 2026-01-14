'use client';

import { useTranslations } from 'next-intl';
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set());

  const getDiscountBadge = (order: Order) => {
    const discountAmount = (order.discount ?? 0) + (order.promoDiscount ?? 0);

    if (order.subtotal && order.subtotal > 0 && discountAmount > 0) {
      const percent = Math.round((discountAmount / order.subtotal) * 100);
      if (percent > 0) return `-${percent}%`;
    }

    if (order.discount && order.discount > 0 && order.discount <= 100) {
      return `-${order.discount}%`;
    }

    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}.${month}.${year}`;
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
    <section className="p-5 py-10 md:p-10 lg:py-14" aria-labelledby="orders-heading">
      <div className="flex flex-col gap-2 md:gap-4 ">
        {orders.map((order, index) => {
          const isExpanded = expandedOrders.has(order.id);
          const isLoading = loadingOrders.has(order.id);
          const orderTotal = order.totalPrice || calculateOrderTotal(order);

          return (
            <div key={order.id} className="flex flex-col gap-3">
              {/* Order Card */}
              <article className="rounded-[25px] bg-background-secondary border-input border-transparent transition-all duration-300 md:hover:border-input">
                <div
                  className="flex items-center justify-between 
          gap-1 md:gap-2 p-2 md:p-3 lg:pl-6
          font-semibold text-[clamp(10px,2vw,23px)]"
                >
                  <h3>{t('orderNumber', { number: index + 1 })}</h3>
                  <span>{formatDate(order.createdAt)}</span>

                  <PrimaryButton
                    onClick={() => toggleOrderDetails(order.id)}
                    className="text-[clamp(10px,2vw,22px)] min-w-[80px] md:min-w-[140px] xl:min-w-[290px] p-3 lg:py-6"
                    loading={isLoading}
                  >
                    {isExpanded ? t('hideDetails') : t('viewDetails')}
                  </PrimaryButton>
                </div>
              </article>

              {/* Order Details – separate block under the card */}
              {isExpanded && (
                <div className="shadow-order bg-background-primary p-2 pb-4 md:p-3 md:pb-9 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 pl-3 lg:pl-6 mb-3 lg:mb-6 font-semibold text-[clamp(10px,2vw,18px)]">
                    <span>{t('status')}:</span>
                    <span>{getStatusLabel(order.status)}</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {order.products.map((item, idx) => (
                      <OrderProductCard
                        key={`${order.id}-product-${idx}`}
                        product={item.product!}
                        quantity={item.quantity}
                      />
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 pl-3 lg:pl-6 mt-4 lg:mt-8">
                      <div className="flex gap-2 items-center justify-center">
                        <span className="font-semibold text-[clamp(12px,2vw,18px)]">
                          {t('totalWithVat')}
                        </span>
                        <span className="font-normal text-[clamp(10px,2vw,14px)]">
                          {t('totalWithVatSpan')}
                        </span>
                      </div>
                      <span className="font-semibold text-[clamp(10px,3vw,18px)] items-center text-center mx-auto">
                        € {orderTotal.toFixed(2)}
                      </span>
                      <span className="text-right ml-auto pr-1 lg:pr-6 ">
                        {getDiscountBadge(order) && (
                          <span className="text-[clamp(10px,3vw,18px)] text-text-soft font-semibold">
                            {getDiscountBadge(order)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !isExpanded && (
                <div className="p-4 flex items-center justify-center">
                  <Spinner size="md" colorScheme="accent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
