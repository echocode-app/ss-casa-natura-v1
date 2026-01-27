import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import SimpleBreadcrumbs from '@/components/ui/Breadcrumbs/SimpleBreadcrumbs';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import CheckoutDraft from '@/lib/db/models/CheckoutDraft';
import mongoose from 'mongoose';
import { getStripe } from '@/lib/stripe/server';
import { finalizePaidOrderOnce } from '@/lib/checkout/finalizePaidOrder';
import Check from '@/components/ui/Buttons/Check';
import User from '@/components/ui/Buttons/User';

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
  const tHeaderActions = await getTranslations('header.actions');
  const tCart = await getTranslations('user.cart');

  return (
    <>
      <SimpleBreadcrumbs
        items={[
          { label: tHeaderActions('home'), href: '/' },
          { label: tCart('title'), href: '/cart' },
          { label: t('title'), href: '/checkout' },
          { label: t('success.title') },
        ]}
      />
      <section className="px-6 md:px-8 lg:px-10 py-10 md:py-16 lg:pb-32">
        <div className="max-w-[900px] mx-auto flex items-center justify-center">
          <div className="w-full flex flex-col items-center text-center">
            <h1 className="heading-default heading-sm md:heading-lg xl:heading-xl font-semibold mb-4 md:mb-6">
              {t('success.title')}
            </h1>

            <div className="mb-6 md:mb-8">
              <Check />
            </div>

            <p className="text-text-muted text-[clamp(16px,2vw,22px)] leading-relaxed mb-8 md:mb-10">
              {t('success.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 items-center justify-center">
              <Link
                href="/prodotti"
                className="
                  relative
                  bg-brand-accent
                  text-black
                  font-semibold
                  text-[clamp(14px,2vw,22px)]
                  text-center
                  rounded-[25px]
                  transition-all duration-300
                  hover:shadow-header
                  hover:opacity-90
                  focus:outline-none
                  focus:shadow-header
                  focus:ring-0
                  active:outline-none
                  active:ring-0
                  px-8 py-4
                  inline-flex items-center justify-center
                "
              >
                {t('success.toCatalog')}
              </Link>
              <Link
                href="/account"
                className="group inline-flex items-center gap-2 text-brand-dark hover:underline text-[clamp(14px,1.6vw,18px)] transition-transform duration-300"
              >
                <User className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 md:group-hover:scale-110 md:group-focus-visible:scale-110" />
                {t('success.toAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
