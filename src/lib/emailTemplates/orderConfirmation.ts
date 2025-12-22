interface OrderConfirmationParams {
  userName: string;
  orderId: string;
  totalAmount: number;
  deliveryPrice: number;
  status: string;
  products: { name: string; quantity: number; price: number }[];
}

export const orderConfirmationTemplate = ({
  userName,
  orderId,
  totalAmount,
  deliveryPrice,
  status,
  products,
}: OrderConfirmationParams) => {
  return `
Ciao ${userName},

Il tuo ordine ${orderId} è stato ricevuto.
Totale: €${totalAmount.toFixed(2)}
Spedizione: €${deliveryPrice.toFixed(2)}
Stato: ${status}

Prodotti:
${products.map((p) => `- ${p.name} x ${p.quantity} @ €${p.price}`).join('\n')}

Grazie per aver acquistato con noi!
`;
};
