import mongoose, { Schema, model } from 'mongoose';

// Cart Item Schema (embedded in Cart)
const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String, required: true },
    title: { type: String, required: true },
    imageSrc: { type: String },
    price: { type: Number, required: true },
    volume: { type: Number },
    unit: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
  },
  { _id: true },
);

// Cart Schema
const cartSchema = new Schema(
  {
    userId: { type: String },
    sessionId: { type: String },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: { type: String },
    promoDiscount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Index for efficient cart lookup
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });

export default mongoose.models.Cart || model('Cart', cartSchema);
