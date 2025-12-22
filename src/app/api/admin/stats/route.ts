import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Order, { IOrder, IOrderProduct } from '@/lib/db/models/Order';
import Product, { IProduct } from '@/lib/db/models/Product';
import { adminAuth } from '@/lib/utils/adminAuth';
import { log } from '@/lib/utils/logger';

const handler = async (req: NextRequest) => {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await connectToDB();
  log('server', 'Connected to DB for stats');

  try {
    const totalOrders = await Order.countDocuments();

    const paidOrders: IOrder[] = await Order.find({ status: 'paid' }).populate(
      'products.productId',
    );

    const totalRevenue = paidOrders.reduce((sum: number, order: IOrder) => {
      const orderTotal = order.products.reduce((s: number, item: IOrderProduct) => {
        let price = (item.productId as IProduct).price;
        if ((item.productId as IProduct).promoPrice)
          price = (item.productId as IProduct).promoPrice!;
        if ((item.productId as IProduct).seasonalDiscount)
          price = price - ((item.productId as IProduct).seasonalDiscount! / 100) * price;

        return s + price * item.quantity;
      }, 0);
      return sum + orderTotal;
    }, 0);

    const statusAggregation = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const topProductsAggregation = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.productId', sold: { $sum: '$products.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);

    const topProducts: IProduct[] = await Product.find({
      _id: { $in: topProductsAggregation.map((p) => p._id) },
    }).lean();

    const topProductsWithCount = topProductsAggregation.map((p) => {
      const prod = topProducts.find((t) => t._id.toString() === p._id.toString());
      return {
        _id: p._id,
        name: prod?.name || 'Unknown',
        sold: p.sold,
      };
    });

    const response = {
      totalOrders,
      totalRevenue,
      statusCounts: statusAggregation,
      topProducts: topProductsWithCount,
    };

    log('success', 'Fetched sales stats');
    return NextResponse.json(response);
  } catch (error: any) {
    log('error', 'Error fetching stats', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const GET = adminAuth(handler);
