import mongoose, { Schema, Document, Types } from 'mongoose';
import { IProduct } from './Product';

export interface IOrderProduct {
  productId: Types.ObjectId | string | IProduct;
  variantId?: string;
  slug?: string;
  title?: string;
  price?: number;
  imageSrc?: string;
  quantity: number;
  volume?: number;
  unit?: string;
}

export interface IOrderAddress {
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  province?: string;
}

export interface IOrder extends Document {
  userId?: Types.ObjectId;
  products: IOrderProduct[];
  status: 'pending' | 'paid' | 'shipped' | 'canceled';
  currency?: 'EUR';
  subtotal?: number;
  shippingPrice?: number;
  totalPrice?: number;
  promoCode?: string;
  discount?: number;
  promoDiscount?: number;

  checkoutId?: string;

  customerEmail?: string;
  customerName?: string;
  customerSurname?: string;
  customerPhone?: string;
  shippingAddress?: IOrderAddress;
  marketingOptIn?: boolean;

  stripePaymentIntentId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: Schema.Types.Mixed, required: true },
    variantId: { type: String },
    slug: { type: String },
    title: { type: String },
    price: { type: Number },
    imageSrc: { type: String },
    quantity: { type: Number, required: true },
    volume: { type: Number },
    unit: { type: String },
  },
  { _id: false },
);

const orderAddressSchema = new Schema<IOrderAddress>(
  {
    country: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    province: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    products: [orderProductSchema],
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'canceled'], default: 'pending' },
    currency: { type: String, enum: ['EUR'], default: 'EUR' },
    subtotal: Number,
    shippingPrice: Number,
    totalPrice: Number,
    promoCode: String,
    discount: Number,
    promoDiscount: Number,

    checkoutId: { type: String, index: true, unique: true, sparse: true },

    customerEmail: String,
    customerName: String,
    customerSurname: String,
    customerPhone: String,
    shippingAddress: orderAddressSchema,
    marketingOptIn: Boolean,

    stripePaymentIntentId: { type: String, index: true },
    paidAt: Date,
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
