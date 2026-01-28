import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import CheckoutDraft from '@/lib/db/models/CheckoutDraft';
import mongoose from 'mongoose';
import { getStripe } from '@/lib/stripe/server';
import { finalizePaidOrderOnce } from '@/lib/checkout/finalizePaidOrder';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export const dynamic = 'force-dynamic';

type PageProps = {
  // Next.js may pass searchParams as a Promise in newer versions.
  searchParams?:
    | {
        orderId?: string | string[];
        preview?: string | string[];
        payment_intent?: string | string[];
      }
    | Promise<{
        orderId?: string | string[];
        preview?: string | string[];
        payment_intent?: string | string[];
      }>;
};

function asSingleString(value: string | string[] | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
}

async function assertPaidOrderOrNotFound(
  orderId: string,
  paymentIntentFromQuery: string | null,
): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(orderId)) notFound();

  await connectToDB();

  const order: any = await Order.findById(orderId).lean();

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    notFound();
  }

  const paymentIntentId = paymentIntentFromQuery || order?.stripePaymentIntentId;
  if (!paymentIntentId) notFound();

  const pi = await stripe.paymentIntents.retrieve(String(paymentIntentId));

  const metaOrderId = (pi as any)?.metadata?.orderId;
  if (metaOrderId && metaOrderId !== orderId) notFound();

  if (pi.status !== 'succeeded') notFound();

  if (!order) {
    const draft: any = await CheckoutDraft.findOne({ orderId }).lean();
    if (!draft) notFound();

    await Order.create({
      _id: new mongoose.Types.ObjectId(orderId),
      userId: draft.userId,
      status: 'paid',
      currency: draft.currency || 'EUR',
      subtotal: draft.subtotal,
      shippingPrice: draft.shippingPrice,
      totalPrice: draft.totalPrice,
      promoCode: draft.promoCode,
      promoDiscount: draft.promoDiscount,
      checkoutId: draft.checkoutId,
      customerEmail: draft.customerEmail,
      customerName: draft.customerName,
      customerSurname: draft.customerSurname,
      customerPhone: draft.customerPhone,
      shippingAddress: draft.shippingAddress,
      shippingMethod: draft.shippingMethod,
      marketingOptIn: draft.marketingOptIn,
      stripePaymentIntentId: pi.id,
      paidAt: new Date(),
      products: (draft.products || []).map((p: any) => ({
        productId: p.productId,
        variantId: p.variantId,
        slug: p.slug,
        title: p.title,
        price: p.price,
        quantity: p.quantity,
        volume: p.volume,
        unit: p.unit,
      })),
    });

    await finalizePaidOrderOnce({ orderId, paymentIntent: pi });
    await CheckoutDraft.deleteOne({ orderId });
    return;
  }

  await Order.updateOne(
    { _id: order._id },
    {
      $set: {
        status: 'paid',
        paidAt: new Date(),
        stripePaymentIntentId: pi.id,
      },
    },
  );

  await finalizePaidOrderOnce({ orderId, paymentIntent: pi });
  await CheckoutDraft.deleteOne({ orderId });
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams: any =
    searchParams && typeof (searchParams as any).then === 'function'
      ? await (searchParams as any)
      : searchParams;

  const preview = asSingleString(resolvedSearchParams?.preview);
  const previewEnabled = preview === '1' || preview === 'true';

  const paymentIntentFromQuery = asSingleString(resolvedSearchParams?.payment_intent);

  const host = (await headers()).get('host') || '';
  const isLocalHost =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]');

  const isPreview = previewEnabled && (process.env.NODE_ENV !== 'production' || isLocalHost);

  const orderId = asSingleString(resolvedSearchParams?.orderId) || (isPreview ? 'preview' : null);
  if (!orderId) notFound();

  if (!isPreview) {
    await assertPaidOrderOrNotFound(orderId, paymentIntentFromQuery);
  }

  const t = await getTranslations('checkout');

  return (
    <CheckoutSuccessClient
      translations={{
        title: t('success.title'),
        description: t('success.description'),
        toCatalog: t('success.toCatalog'),
        toAccount: t('success.toAccount'),
      }}
    />
  );
}
