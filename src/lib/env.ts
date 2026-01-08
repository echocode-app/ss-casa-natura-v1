export const env = {
  stripeSecret: process.env.STRIPE_SECRET_KEY!,
  stripeWebhook: process.env.STRIPE_WEBHOOK_SECRET!,
  stripePublic: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
};
