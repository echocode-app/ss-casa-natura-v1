import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import PromoCode from '@/lib/db/models/PromoCode';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import User from '@/lib/db/models/User';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { ApplyPromoCodeRequest, CartItemDB } from '@/types/cart';
import { z } from 'zod';

const applyPromoSchema = z.object({
  promoCode: z
    .string()
    .min(1, 'Codice promozionale richiesto')
    .max(50, 'Codice promozionale troppo lungo'),
  email: z.string().email('Indirizzo email non valido').optional(),
});

/**
 * POST /api/cart/promo/apply
 * Applica un codice promozionale al carrello
 * - Supporta sia utenti autenticati che guest
 * - Blocca riutilizzo per email
 * - Aggiunge email a MarketingEmails
 */
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  // 1. Parse and validate request body
  let body: ApplyPromoCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Richiesta non valida' }, { status: 400 });
  }

  const validation = applyPromoSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return NextResponse.json(
      { success: false, error: firstError?.message || 'Dati non validi' },
      { status: 400 },
    );
  }

  const { promoCode, email: emailFromBody } = validation.data;
  const sessionId = await getCartSessionId();
  const userId = await getUserIdFromRequest(req);

  // 2. Resolve email (from authenticated user or request body)
  let resolvedEmail: string | undefined;
  if (userId) {
    const user = await User.findById(userId).select('email').lean();
    resolvedEmail = user?.email;
  } else {
    resolvedEmail = emailFromBody;
  }

  if (!resolvedEmail) {
    return NextResponse.json(
      {
        success: false,
        error: 'Inserisci un indirizzo email per applicare il codice promozionale',
      },
      { status: 400 },
    );
  }

  const normalizedEmail = resolvedEmail.trim().toLowerCase();

  // 3. Find cart
  const cart = await Cart.findOne({ $or: [{ userId }, { sessionId }] });
  if (!cart) {
    return NextResponse.json(
      { success: false, error: 'Carrello non trovato. Aggiungi almeno un prodotto.' },
      { status: 404 },
    );
  }

  if (cart.items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Il carrello è vuoto. Aggiungi prodotti prima di applicare il codice.',
      },
      { status: 400 },
    );
  }

  // 4. Find and validate promo code
  const normalizedCode = promoCode.toUpperCase().trim();

  const promo = await PromoCode.findOne({
    code: normalizedCode,
  });

  if (!promo) {
    return NextResponse.json(
      { success: false, error: 'Codice promozionale non valido' },
      { status: 404 },
    );
  }

  // Check if already used by this email
  if (promo.usedByEmails.includes(normalizedEmail)) {
    return NextResponse.json(
      { success: false, error: 'Hai già utilizzato questo codice promozionale' },
      { status: 400 },
    );
  }

  // Check if active
  const now = new Date();
  if (promo.activeFrom && promo.activeFrom > now) {
    return NextResponse.json(
      { success: false, error: 'Questo codice non è ancora attivo' },
      { status: 400 },
    );
  }

  if (promo.activeUntil && promo.activeUntil < now) {
    return NextResponse.json({ success: false, error: 'Questo codice è scaduto' }, { status: 400 });
  }

  // Check usage limit
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return NextResponse.json(
      { success: false, error: 'Questo codice ha raggiunto il limite di utilizzi' },
      { status: 400 },
    );
  }

  // 5. Calculate discount
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = Math.round(((cart.subtotal * promo.value) / 100) * 100) / 100;
  } else if (promo.type === 'fixed') {
    discount = Math.min(promo.value, cart.subtotal);
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, cart.subtotal);

  // 6. Update cart
  cart.promoCode = promo.code;
  cart.promoDiscount = discount;
  cart.total = cart.subtotal - (cart.discount || 0) - discount;

  // 7. Update promo code usage
  promo.usedCount = (promo.usedCount || 0) + 1;
  promo.usedByEmails.push(normalizedEmail);

  // 8. Add email to marketing list (upsert)
  try {
    await MarketingEmail.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, source: 'promo_code' },
      { upsert: true, new: true },
    );
  } catch {
    // Log but don't fail the request if marketing email fails
    // Silently fail - marketing email is not critical
  }

  // 9. Save cart and promo
  try {
    await Promise.all([cart.save(), promo.save()]);
  } catch {
    return NextResponse.json(
      { success: false, error: "Errore durante l'applicazione del codice. Riprova." },
      { status: 500 },
    );
  }

  // 10. Return updated cart
  return NextResponse.json({
    success: true,
    message: 'Codice promozionale applicato con successo!',
    cart: {
      id: cart._id.toString(),
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items.map((item: CartItemDB) => ({
        id: item._id?.toString() || item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        imageSrc: item.imageSrc,
        price: item.price,
        volume: item.volume,
        unit: item.unit,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      promoCode: cart.promoCode,
      promoDiscount: cart.promoDiscount,
      total: cart.total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    },
  });
});
