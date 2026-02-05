import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireAdminSection } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import Order from '@/lib/db/models/Order';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import { applyInventoryToCatalogProducts } from '@/lib/utils/inventory';

export const GET = handleApi(async () => {
  const authError = await requireAdminSection('dashboard');
  if (authError) return authError;

  await connectToDB();

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);

  const orderStatusFilter = { status: { $in: ['paid', 'shipped'] } };
  const paidWeekQuery = {
    ...orderStatusFilter,
    $or: [
      { paidAt: { $gte: weekAgo } },
      { paidAt: { $exists: false }, createdAt: { $gte: weekAgo } },
    ],
  };
  const paidMonthQuery = {
    ...orderStatusFilter,
    $or: [
      { paidAt: { $gte: monthAgo } },
      { paidAt: { $exists: false }, createdAt: { $gte: monthAgo } },
    ],
  };

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
    Order.countDocuments(orderStatusFilter),
    Order.countDocuments(paidWeekQuery),
    Order.countDocuments(paidMonthQuery),
  ]);

  const promoEmails = await MarketingEmail.find({})
    .sort({ createdAt: -1 })
    .select({ email: 1, createdAt: 1 })
    .limit(200)
    .lean();

  const recentOrders = await Order.find(paidMonthQuery)
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

  // Collect products with low stock (<= 5) from variants
  const lowStockItems: Array<{
    productId: string;
    title: string;
    sku: string;
    stock: number;
    variantLabel?: string;
    variantId?: string;
  }> = [];

  for (const p of products) {
    // Check variants for low stock
    if (p.variants && Array.isArray(p.variants)) {
      for (const v of p.variants) {
        const isAvailable = v.isAvailable !== false;
        if (isAvailable && typeof v.stock === 'number' && v.stock <= 5) {
          lowStockItems.push({
            productId: p.id,
            title: p.title,
            sku: p.sku,
            stock: v.stock,
            variantLabel: v.label,
            variantId: v.id,
          });
        }
      }
    }
    // Also check product-level stock if exists
    const productAvailable = p.isAvailable !== false;
    if (productAvailable && typeof p.stock === 'number' && p.stock <= 5) {
      lowStockItems.push({
        productId: p.id,
        title: p.title,
        sku: p.sku,
        stock: p.stock,
      });
    }
  }

  const lowStock = lowStockItems.sort((a, b) => a.stock - b.stock).slice(0, 10);

  const integrations = {
    MongoDB: {
      ok: Boolean(process.env.MONGODB_URI),
      url: 'https://cloud.mongodb.com',
      details: process.env.MONGODB_URI ? 'Cluster0' : undefined,
      info: 'Database NoSQL - Free tier: 512MB storage',
    },
    Stripe: {
      ok: Boolean(process.env.STRIPE_SECRET_KEY),
      url: 'https://dashboard.stripe.com',
      details: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'Test Mode' : 'Live Mode',
      info: 'Payment processor - No monthly fees, per transaction',
    },
    Mailchimp: {
      ok: Boolean(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER_PREFIX),
      url: 'https://login.mailchimp.com',
      details: process.env.MAILCHIMP_SERVER_PREFIX
        ? `Server: ${process.env.MAILCHIMP_SERVER_PREFIX}`
        : undefined,
      info: 'Email marketing - Free tier: 500 contacts, 1000 emails/month',
    },
    Cloudinary: {
      ok: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      url: 'https://console.cloudinary.com',
      details: process.env.CLOUDINARY_CLOUD_NAME
        ? `Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`
        : undefined,
      info: 'Media storage - Free tier: 25GB storage, 25GB bandwidth/month',
    },
    Mapbox: {
      ok: Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN),
      url: 'https://account.mapbox.com',
      details: 'Geocoding API',
      info: 'Maps & geocoding - Free tier: 100,000 requests/month',
    },
    Iubenda: {
      ok: Boolean(process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID),
      url: 'https://www.iubenda.com/en/privacy-and-cookie-policy-generator',
      details: process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID
        ? `Policy ID: ${process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID}`
        : undefined,
      info: 'Privacy & Cookie policy - Check subscription plan',
    },
    Vercel: {
      ok: true,
      url: 'https://vercel.com/dashboard',
      details: process.env.VERCEL_ENV || 'Development (local)',
      info: 'Hosting & deployment - Hobby plan: 100GB bandwidth/month',
    },
    'Aruba Domain': {
      ok: true,
      url: 'https://www.aruba.it/home.aspx',
      details: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'localhost',
      info: 'Domain registrar - Annual renewal required',
    },
  };

  return NextResponse.json({
    success: true,
    widgets: {
      users: { total: totalUsers, week: usersWeek, month: usersMonth },
      promoRequests: { total: promoReqTotal, week: promoReqWeek, month: promoReqMonth },
      orders: { total: ordersTotal, week: ordersWeek, month: ordersMonth },
    },
    promoEmails: promoEmails.map((e: any) => ({
      email: e.email,
      createdAt: e.createdAt,
    })),
    topSelling,
    lowStock,
    integrations,
  });
});
