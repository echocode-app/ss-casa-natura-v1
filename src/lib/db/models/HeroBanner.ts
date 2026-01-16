import mongoose, { Schema, model } from 'mongoose';

export interface IHeroBanner {
  image: string;
  title?: string;
  text?: string;
  href?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const heroBannerSchema = new Schema<IHeroBanner>(
  {
    image: { type: String, required: true },
    title: { type: String },
    text: { type: String },
    href: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.HeroBanner || model<IHeroBanner>('HeroBanner', heroBannerSchema);
