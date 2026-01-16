import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import Order from '@/lib/db/models/Order';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';

export const GET = handleApi(async () => {
  const authError = await requireAdmin();
  if (authError) return authError;

  await connectToDB();

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);

  const [
    totalUsers,
    usersWeek,
    usersMonth,
    promoReqTotal,
    promoReqWeek,
    promoReqMonth,
    ordersTotal,
    ordersWeek,
    ordersMonth,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
    User.countDocuments({ createdAt: { $gte: monthAgo } }),
    MarketingEmail.countDocuments({}),
    MarketingEmail.countDocuments({ createdAt: { $gte: weekAgo } }),
    MarketingEmail.countDocuments({ createdAt: { $gte: monthAgo } }),
    Order.countDocuments({}),
    Order.countDocuments({ createdAt: { $gte: weekAgo } }),
    Order.countDocuments({ createdAt: { $gte: monthAgo } }),
  ]);

  const recentOrders = await Order.find({ createdAt: { $gte: monthAgo } })
    .select({ products: 1, createdAt: 1 })
    .limit(400)
    .lean();

  const topByProduct = new Map<
    string,
    { productId: string; title?: string; sku?: string; quantity: number }
  >();

  for (const o of recentOrders) {
    for (const p of o.products || []) {
      const key = String(p.productId);
      const cur = topByProduct.get(key) || {
        productId: key,
        title: (p as any).title,
        sku: undefined,
        quantity: 0,
      };
      cur.quantity += Number((p as any).quantity || 0);
      if (!cur.title && (p as any).title) cur.title = (p as any).title;
      topByProduct.set(key, cur);
    }
  }

  const topSelling = Array.from(topByProduct.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const products = await applyInventoryToCatalogProducts({ includeArchived: false });
  const lowStock = products
    .filter((p: any) => typeof p.stock === 'number' && p.stock <= 5)
    .sort((a: any, b: any) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 5)
    .map((p: any) => ({
      productId: p.id,
      title: p.title,
      sku: p.sku,
      stock: p.stock,
    }));

  const integrations = {
    stripe: {
      ok: Boolean(process.env.STRIPE_SECRET_KEY),
      url: 'https://dashboard.stripe.com',
    },
    mailchimp: {
      ok: Boolean(process.env.MAILCHIMP_API_KEY || process.env.MAILCHIMP_SERVER_PREFIX),
      url: 'https://login.mailchimp.com',
    },
    vercel: {
      ok: Boolean(process.env.VERCEL),
      url: 'https://vercel.com/dashboard',
    },
    mongodb: {
      ok: Boolean(process.env.MONGODB_URI),
      url: 'https://cloud.mongodb.com',
    },
  };

  return NextResponse.json({
    success: true,
    widgets: {
      users: { total: totalUsers, week: usersWeek, month: usersMonth },
      promoRequests: { total: promoReqTotal, week: promoReqWeek, month: promoReqMonth },
      orders: { total: ordersTotal, week: ordersWeek, month: ordersMonth },
    },
    topSelling,
    lowStock,
    integrations,
  });
});
