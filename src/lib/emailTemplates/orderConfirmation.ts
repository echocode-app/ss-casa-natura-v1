import { renderTemplate } from './renderTemplate';

interface OrderConfirmationParams {
  userName: string;
  orderId: string;
  totalAmount: number;
  deliveryPrice: number;
  status: string;
  products: { name: string; quantity: number; price: number }[];
  overrideText?: string | null;
}

export const orderConfirmationTemplate = ({
  userName,
  orderId,
  totalAmount,
  deliveryPrice,
  status,
  products,
  overrideText,
}: OrderConfirmationParams) => {
  const items = products.map((p) => `- ${p.name} x ${p.quantity} @ €${p.price}`).join('\n');
  const template = overrideText?.trim() || DEFAULT_ORDER_CONFIRMATION_TEXT;

  return renderTemplate(template, {
    name: userName,
    orderId,
    totalAmount: `€${totalAmount.toFixed(2)}`,
    deliveryPrice: `€${deliveryPrice.toFixed(2)}`,
    status,
    products: items,
  });
};

export const DEFAULT_ORDER_CONFIRMATION_TEXT = `Ciao {{name}},

Il tuo ordine {{orderId}} è stato ricevuto.
Totale: {{totalAmount}}
Spedizione: {{deliveryPrice}}
Stato: {{status}}

Prodotti:
{{products}}

Grazie per aver acquistato con noi!

---

Hello {{name}},

Your order {{orderId}} has been received.
Total: {{totalAmount}}
Shipping: {{deliveryPrice}}
Status: {{status}}

Products:
{{products}}

Thank you for shopping with us!
`;
