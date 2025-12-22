import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  promoPrice?: number;
  promoCode?: string;
  seasonalDiscount?: number;
  weight?: number;
  volume?: number;
  stock: number;
  sku: string;
  images: string[];
  description: string;
  properties?: Record<string, any>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  popularity?: number;
  relatedProducts?: Types.ObjectId[];
  upsellProducts?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    promoPrice: Number,
    promoCode: String,
    seasonalDiscount: Number,
    weight: Number,
    volume: Number,
    stock: { type: Number, required: true },
    sku: { type: String, required: true, unique: true },
    images: [String],
    description: { type: String, required: true },
    properties: { type: Map, of: Schema.Types.Mixed },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
    popularity: Number,
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    upsellProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
