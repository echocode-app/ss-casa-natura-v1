import mongoose, { Schema, model } from 'mongoose';

export interface ISiteSettings {
  key: 'default';
  promoBar: {
    enabled: boolean;
    text?: string;
    textIt?: string;
    textEn?: string;
    href?: string;
    bgColor?: string;
    textColor?: string;
  };
  globalPromotion: {
    enabled: boolean;
    percent: number;
    scope: 'all' | 'selected';
    productIds: string[];
    bannerEnabled: boolean;
    bannerText?: string;
    bannerBgColor?: string;
    bannerTextColor?: string;
  };
  promoSubscription: {
    enabled: boolean;
  };
  emailTemplates?: {
    welcomeText?: string;
    promoCodeText?: string;
    passwordResetText?: string;
    orderConfirmationText?: string;
    newOrderAdminText?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, enum: ['default'], unique: true, required: true },
    promoBar: {
      enabled: { type: Boolean, default: false },
      text: { type: String },
      textIt: { type: String },
      textEn: { type: String },
      href: { type: String },
      bgColor: { type: String },
      textColor: { type: String },
    },
    globalPromotion: {
      enabled: { type: Boolean, default: false },
      percent: { type: Number, default: 0 },
      scope: { type: String, enum: ['all', 'selected'], default: 'all' },
      productIds: { type: [String], default: [] },
      bannerEnabled: { type: Boolean, default: false },
      bannerText: { type: String },
      bannerBgColor: { type: String },
      bannerTextColor: { type: String },
    },
    promoSubscription: {
      enabled: { type: Boolean, default: true },
    },
    emailTemplates: {
      welcomeText: { type: String },
      promoCodeText: { type: String },
      passwordResetText: { type: String },
      orderConfirmationText: { type: String },
      newOrderAdminText: { type: String },
    },
  },
  { timestamps: true },
);

export default mongoose.models.SiteSettings ||
  model<ISiteSettings>('SiteSettings', siteSettingsSchema);
