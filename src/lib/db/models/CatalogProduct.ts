import mongoose, { Schema, model } from 'mongoose';

const productImageSchema = new Schema(
  {
    src: { type: String, required: true },
    alt: { type: String },
    publicId: { type: String },
  },
  { _id: false },
);

const productVariantSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    volume: { type: Number, required: true },
    unit: { type: String, enum: ['ml', 'l', 'kg', 'g'], required: true },
    price: { type: Number, required: true },
    weightGrams: { type: Number, required: true },
    stock: { type: Number, required: true },
    isAvailable: { type: Boolean, required: true },
    isBestSeller: { type: Boolean, default: false },
  },
  { _id: false },
);

const productDiscountSchema = new Schema(
  {
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    startAt: { type: String },
    endAt: { type: String },
  },
  { _id: false },
);

const productFilterValueSchema = new Schema(
  {
    filterId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

export interface ICatalogProduct {
  id: string;
  slug: string;
  sku: string;
  title: string;
  shortDescription?: string;
  description: string;
  categoryIds: string[];
  lineId?: string;
  images: Array<{ src: string; alt?: string; publicId?: string }>;
  variants: Array<{
    id: string;
    label: string;
    volume: number;
    unit: 'ml' | 'l' | 'kg' | 'g';
    price: number;
    weightGrams: number;
    stock: number;
    isAvailable: boolean;
    isBestSeller?: boolean;
  }>;
  currency: 'EUR';
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    startAt?: string;
    endAt?: string;
  };
  promoEligible?: boolean;
  isEco?: boolean;
  isNewProduct?: boolean;
  isSeasonal?: boolean;
  relatedProductIds?: string[];
  filters?: Array<{ filterId: string; value: string | number | boolean }>;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const catalogProductSchema = new Schema<ICatalogProduct>(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },

    title: { type: String, required: true },
    shortDescription: { type: String },
    description: { type: String, required: true },

    categoryIds: { type: [String], default: [] },
    lineId: { type: String },

    images: { type: [productImageSchema], default: [] },
    variants: { type: [productVariantSchema], default: [] },

    currency: { type: String, enum: ['EUR'], default: 'EUR' },

    discount: { type: productDiscountSchema },
    promoEligible: { type: Boolean },

    isEco: { type: Boolean },
    isNewProduct: { type: Boolean },
    isSeasonal: { type: Boolean },

    relatedProductIds: { type: [String], default: [] },
    filters: { type: [productFilterValueSchema], default: [] },

    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.models.CatalogProduct ||
  model<ICatalogProduct>('CatalogProduct', catalogProductSchema);
