import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryItem extends Document {
  productId: string;
  variantId: string | null;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventoryItem>(
  {
    productId: { type: String, required: true, index: true },
    variantId: { type: String, default: null },
    stock: { type: Number, required: true, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

inventorySchema.index({ productId: 1, variantId: 1 }, { unique: true });

export default mongoose.models.Inventory ||
  mongoose.model<IInventoryItem>('Inventory', inventorySchema);
