import { renderTemplate } from './renderTemplate';

interface NewOrderAdminParams {
  orderId: string;
  userEmail: string;
  totalAmount: number;
  products: { name: string; quantity: number; price: number }[];
  overrideText?: string | null;
}

export const DEFAULT_NEW_ORDER_ADMIN_TEXT = `Nuovo ordine ricevuto: {{orderId}}
Utente: {{userEmail}}
Totale: {{totalAmount}}

Prodotti:
{{products}}
`;

export const newOrderAdminTemplate = ({
  orderId,
  userEmail,
  totalAmount,
  products,
  overrideText,
}: NewOrderAdminParams) => {
  const items = products.map((p) => `- ${p.name} x ${p.quantity} @ €${p.price}`).join('\n');
  const template = overrideText?.trim() || DEFAULT_NEW_ORDER_ADMIN_TEXT;

  return renderTemplate(template, {
    orderId,
    userEmail,
    totalAmount: `€${totalAmount.toFixed(2)}`,
    products: items,
  });
};
