import mongoose, { Schema, model } from 'mongoose';

export interface IHeroBanner {
  image: string;
  title?: string;
  text?: string;
  cta?: string;
  href?: string;

  titleIt?: string;
  subtitleIt?: string;
  ctaIt?: string;
  titleEn?: string;
  subtitleEn?: string;
  ctaEn?: string;

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
    cta: { type: String },
    href: { type: String },

    titleIt: { type: String },
    subtitleIt: { type: String },
    ctaIt: { type: String },
    titleEn: { type: String },
    subtitleEn: { type: String },
    ctaEn: { type: String },

    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.HeroBanner || model<IHeroBanner>('HeroBanner', heroBannerSchema);
