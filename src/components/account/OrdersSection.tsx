import { useTranslations } from 'next-intl';

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
}

interface OrdersSectionProps {
  orders: Order[];
}

export default function OrdersSection({ orders }: OrdersSectionProps) {
  const t = useTranslations('user.account.orders');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <section
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
      aria-labelledby="orders-heading"
    >
      <h2 id="orders-heading" className="text-xl font-semibold text-gray-900 mb-6">
        {t('title')}
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('noOrders')}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {t('orderNumber', { number: order.id })}
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">{t('status')}:</span>{' '}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">{t('total')}:</span>{' '}
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <p>
                      <span className="font-medium">{t('date')}:</span>{' '}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
