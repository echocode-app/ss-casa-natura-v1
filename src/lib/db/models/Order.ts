import mongoose, { Schema, Document, Types } from 'mongoose';
import { IProduct } from './Product';

export interface IOrderProduct {
  productId: Types.ObjectId | IProduct;
  quantity: number;
  volume?: number;
  unit?: string;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  products: IOrderProduct[];
  status: 'pending' | 'paid' | 'shipped' | 'canceled';
  subtotal?: number;
  totalPrice?: number;
  promoCode?: string;
  discount?: number;
  promoDiscount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    volume: { type: Number },
    unit: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [orderProductSchema],
    status: { type: String, enum: ['pending', 'paid', 'shipped', 'canceled'], default: 'pending' },
    subtotal: Number,
    totalPrice: Number,
    promoCode: String,
    discount: Number,
    promoDiscount: Number,
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
