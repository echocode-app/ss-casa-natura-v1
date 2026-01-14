import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  issuedToEmail?: string;
  type: 'percentage' | 'fixed';
  value: number;
  appliesToProducts?: Types.ObjectId[];
  appliesToCategory?: string;
  activeFrom?: Date;
  activeUntil?: Date;
  usageLimit?: number;
  usedCount?: number;
  usedByEmails: string[];
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true, unique: true },
    issuedToEmail: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    appliesToProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    appliesToCategory: String,
    activeFrom: Date,
    activeUntil: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    usedByEmails: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.PromoCode ||
  mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);
