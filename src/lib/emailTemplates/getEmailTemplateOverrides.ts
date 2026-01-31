import connectToDB from '@/lib/db/mongo';
import SiteSettings from '@/lib/db/models/SiteSettings';

export type EmailTemplateOverrides = {
  welcomeText?: string;
  promoCodeText?: string;
  passwordResetText?: string;
  orderConfirmationText?: string;
  newOrderAdminText?: string;
};

export async function getEmailTemplateOverrides(): Promise<EmailTemplateOverrides> {
  await connectToDB();
  const doc = await SiteSettings.findOne({ key: 'default' }).lean();
  return (doc?.emailTemplates as EmailTemplateOverrides) || {};
}
