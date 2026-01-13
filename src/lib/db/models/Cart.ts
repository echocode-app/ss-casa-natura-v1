import mongoose, { Schema, model } from 'mongoose';

// Cart Item Schema (embedded in Cart)
const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String, required: true },
    slug: { type: String },
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
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient cart lookup
cartSchema.index({ userId: 1 });
cartSchema.index({ sessionId: 1 });

// TTL Index for automatic cleanup
// MongoDB will automatically delete documents when expiresAt is reached
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Cart || model('Cart', cartSchema);
