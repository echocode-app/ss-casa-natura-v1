import mongoose, { Schema, model } from 'mongoose';

export interface IMarketingEmail {
  email: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const marketingEmailSchema = new Schema<IMarketingEmail>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      default: 'promo_code',
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.MarketingEmail ||
  model<IMarketingEmail>('MarketingEmail', marketingEmailSchema);
