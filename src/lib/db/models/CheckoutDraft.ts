import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICheckoutDraftProduct {
  productId: string;
  variantId: string;
  slug?: string;
  title?: string;
  price?: number;
  quantity: number;
  volume?: number;
  unit?: string;
}

export interface ICheckoutDraftAddress {
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  company?: string;
  addressLine2?: string;
  province?: string;
}

export interface ICheckoutDraft extends Document {
  orderId: string;
  checkoutId?: string;

  userId?: Types.ObjectId;
  sessionId?: string;

  products: ICheckoutDraftProduct[];
  currency?: 'EUR';
  subtotal?: number;
  shippingPrice?: number;
  totalPrice?: number;
  promoCode?: string;
  promoDiscount?: number;

  customerEmail?: string;
  customerName?: string;
  customerSurname?: string;
  customerPhone?: string;
  shippingAddress?: ICheckoutDraftAddress;
  shippingMethod?: 'one_time' | 'recurring_4w';
  marketingOptIn?: boolean;

  stripePaymentIntentId?: string;
  status: 'open' | 'failed' | 'paid';

  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ICheckoutDraftProduct>(
  {
    productId: { type: String, required: true },
    variantId: { type: String, required: true },
    slug: { type: String },
    title: { type: String },
    price: { type: Number },
    quantity: { type: Number, required: true },
    volume: { type: Number },
    unit: { type: String },
  },
  { _id: false },
);

const addressSchema = new Schema<ICheckoutDraftAddress>(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    addressLine1: { type: String, required: true },
    company: { type: String },
    addressLine2: { type: String },
    province: { type: String },
  },
  { _id: false },
);

const checkoutDraftSchema = new Schema<ICheckoutDraft>(
  {
    orderId: { type: String, required: true, index: true },
    checkoutId: { type: String, index: true, unique: true, sparse: true },

    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, index: true },

    products: { type: [productSchema], default: [] },
    currency: { type: String, enum: ['EUR'], default: 'EUR' },
    subtotal: Number,
    shippingPrice: Number,
    totalPrice: Number,
    promoCode: String,
    promoDiscount: Number,

    customerEmail: String,
    customerName: String,
    customerSurname: String,
    customerPhone: String,
    shippingAddress: addressSchema,
    shippingMethod: { type: String, enum: ['one_time', 'recurring_4w'] },
    marketingOptIn: Boolean,

    stripePaymentIntentId: { type: String, index: true },
    status: { type: String, enum: ['open', 'failed', 'paid'], default: 'open', index: true },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.models.CheckoutDraft ||
  mongoose.model<ICheckoutDraft>('CheckoutDraft', checkoutDraftSchema);
