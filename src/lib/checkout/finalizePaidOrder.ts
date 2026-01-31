import Order from '@/lib/db/models/Order';
import Cart from '@/lib/db/models/Cart';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import PromoCode from '@/lib/db/models/PromoCode';
import { subscribeToMailchimp } from '@/lib/mailchimp/subscribe';
import { sendEmail } from '@/lib/utils/sendEmail';
import { orderConfirmationTemplate } from '@/lib/emailTemplates/orderConfirmation';
import { logError } from '@/lib/utils/logger';
import { decrementInventoryForOrderProducts } from '@/lib/utils/inventory';
import { getEmailTemplateOverrides } from '@/lib/emailTemplates/getEmailTemplateOverrides';
import User from '@/lib/db/models/User';
import { newOrderAdminTemplate } from '@/lib/emailTemplates/newOrderAdmin';

export async function finalizePaidOrderOnce({
  orderId,
  paymentIntent,
}: {
  orderId: string;
  paymentIntent: any;
}): Promise<void> {
  const claimed = await Order.findOneAndUpdate(
    { _id: orderId, finalizedAt: { $exists: false } },
    { $set: { finalizedAt: new Date() } },
    { new: true },
  ).lean();

  if (!claimed) return;

  try {
    const orderProducts = (claimed.products || []).map((p: any) => ({
      productId: String(p.productId),
      variantId: String(p.variantId),
      quantity: Number(p.quantity) || 1,
    }));

    await decrementInventoryForOrderProducts(orderProducts);
  } catch (e) {
    logError('[finalizePaidOrderOnce] inventory decrement failed', e);
  }

  if (claimed.promoCode && claimed.customerEmail) {
    const code = String(claimed.promoCode).trim().toUpperCase();
    const email = claimed.customerEmail.trim().toLowerCase();
    if (code && email) {
      try {
        await PromoCode.updateOne(
          { code, usedByEmails: { $ne: email } },
          { $inc: { usedCount: 1 }, $push: { usedByEmails: email } },
        );
      } catch {
        // ignore
      }
    }
  }

  const sessionId = paymentIntent?.metadata?.sessionId;
  const userId = paymentIntent?.metadata?.userId;

  const cartReset = {
    $set: {
      items: [],
      subtotal: 0,
      discount: 0,
      promoCode: undefined,
      promoEmail: undefined,
      promoDiscount: 0,
      total: 0,
    },
  };

  try {
    if (sessionId) await Cart.findOneAndUpdate({ sessionId }, cartReset);
    if (userId) await Cart.findOneAndUpdate({ userId }, cartReset);
  } catch (e) {
    logError('[finalizePaidOrderOnce] cart reset failed', e);
  }

  const overrides = await getEmailTemplateOverrides();

  const to = claimed.customerEmail;
  if (to) {
    const products = (claimed.products || []).map((p: any) => ({
      name: p.title || String(p.productId),
      quantity: p.quantity,
      price: p.price || 0,
    }));

    const text = orderConfirmationTemplate({
      userName: claimed.customerName || 'Cliente',
      orderId: claimed._id.toString(),
      totalAmount: claimed.totalPrice || 0,
      deliveryPrice: claimed.shippingPrice || 0,
      status: claimed.status,
      products,
      overrideText: overrides.orderConfirmationText,
    });

    try {
      await sendEmail({
        to,
        subject: `Conferma ordine ${claimed._id.toString()}`,
        text,
      });
    } catch {
      // ignore
    }
  }

  try {
    const adminUsers = await User.find({
      $or: [{ role: 'superadmin' }, { role: 'admin', adminSections: 'orders' }],
    })
      .select('email')
      .lean();

    const adminEmails = Array.from(
      new Set(
        adminUsers
          .map((u: any) =>
            String(u.email || '')
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean),
      ),
    );

    if (adminEmails.length > 0) {
      const products = (claimed.products || []).map((p: any) => ({
        name: p.title || String(p.productId),
        quantity: p.quantity,
        price: p.price || 0,
      }));

      const adminText = newOrderAdminTemplate({
        orderId: claimed._id.toString(),
        userEmail: claimed.customerEmail || '—',
        totalAmount: claimed.totalPrice || 0,
        products,
        overrideText: overrides.newOrderAdminText,
      });

      await Promise.all(
        adminEmails.map((email) =>
          sendEmail({
            to: email,
            subject: `Nuovo ordine ${claimed._id.toString()}`,
            text: adminText,
          }).catch(() => null),
        ),
      );
    }
  } catch {
    // ignore
  }

  if (claimed.marketingOptIn && claimed.customerEmail) {
    const email = claimed.customerEmail.trim().toLowerCase();
    try {
      await MarketingEmail.findOneAndUpdate(
        { email },
        { email, source: 'checkout' },
        { upsert: true, new: true },
      );
    } catch {
      // ignore
    }

    try {
      await subscribeToMailchimp(email, 'checkout');
    } catch {
      // ignore
    }
  }
}
