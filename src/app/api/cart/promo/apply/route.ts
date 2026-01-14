import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import PromoCode from '@/lib/db/models/PromoCode';
import User from '@/lib/db/models/User';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { ApplyPromoCodeRequest, CartItemDB } from '@/types/cart';
import { extendCartExpiration } from '@/lib/constants/cart';
import { z } from 'zod';
import { buildCartQuery } from '@/lib/utils/cartQuery';

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
 * - Blocca riutilizzo per email (consumato dopo pagamento)
 * - Se il promo e' stato emesso per un email specifico, lo accetta solo per quell'email
 */
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  // 1. Parse and validate request body
  let body: ApplyPromoCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_JSON', error: 'Richiesta non valida' },
      { status: 400 },
    );
  }

  const validation = applyPromoSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        error: firstError?.message || 'Dati non validi',
      },
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
        errorCode: 'PROMO_EMAIL_REQUIRED',
        error: 'Inserisci un indirizzo email per applicare il codice promozionale',
      },
      { status: 400 },
    );
  }

  const normalizedEmail = resolvedEmail.trim().toLowerCase();

  // 3. Find cart
  const cartQuery = buildCartQuery({ userId, sessionId });
  if (!cartQuery) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'CART_SESSION_UNAVAILABLE',
        error: 'Cart session not available',
      },
      { status: 400 },
    );
  }

  const cart = await Cart.findOne(cartQuery);
  if (!cart) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'CART_NOT_FOUND',
        error: 'Carrello non trovato. Aggiungi almeno un prodotto.',
      },
      { status: 404 },
    );
  }

  if (cart.items.length === 0) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'CART_EMPTY',
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
      {
        success: false,
        errorCode: 'PROMO_NOT_FOUND',
        error: 'Codice promozionale non valido',
      },
      { status: 404 },
    );
  }

  // If issued for a specific email, only that email can use it.
  if (promo.issuedToEmail && promo.issuedToEmail !== normalizedEmail) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'PROMO_EMAIL_MISMATCH',
        error: "Questo codice e' valido solo per questa email",
      },
      { status: 400 },
    );
  }

  // Check if already used by this email
  if (promo.usedByEmails.includes(normalizedEmail)) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'PROMO_ALREADY_USED_BY_EMAIL',
        error: 'Hai già utilizzato questo codice promozionale',
      },
      { status: 400 },
    );
  }

  // Check if active
  const now = new Date();
  if (promo.activeFrom && promo.activeFrom > now) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'PROMO_NOT_ACTIVE_YET',
        error: 'Questo codice non è ancora attivo',
      },
      { status: 400 },
    );
  }

  if (promo.activeUntil && promo.activeUntil < now) {
    return NextResponse.json(
      { success: false, errorCode: 'PROMO_EXPIRED', error: 'Questo codice è scaduto' },
      { status: 400 },
    );
  }

  // Check usage limit
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'PROMO_USAGE_LIMIT_REACHED',
        error: 'Questo codice ha raggiunto il limite di utilizzi',
      },
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
  // Bind promo to the email used for validation (helps keep logic consistent on cart updates/checkout)
  cart.promoEmail = normalizedEmail;
  cart.promoDiscount = discount;
  cart.total = cart.subtotal - (cart.discount || 0) - discount;

  // 9. Extend expiration on cart activity
  const isAuthenticated = !!cart.userId;
  cart.expiresAt = extendCartExpiration(isAuthenticated);

  // 10. Save cart
  try {
    await cart.save();
  } catch {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'PROMO_APPLY_FAILED',
        error: "Errore durante l'applicazione del codice. Riprova.",
      },
      { status: 500 },
    );
  }

  // 11. Return updated cart
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
        slug: item.slug,
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
