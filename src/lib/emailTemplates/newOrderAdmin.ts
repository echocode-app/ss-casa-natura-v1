interface NewOrderAdminParams {
  orderId: string;
  userEmail: string;
  totalAmount: number;
  products: { name: string; quantity: number; price: number }[];
}

export const newOrderAdminTemplate = ({
  orderId,
  userEmail,
  totalAmount,
  products,
}: NewOrderAdminParams) => {
  return `
Nuovo ordine ricevuto: ${orderId}
Utente: ${userEmail}
Totale: €${totalAmount.toFixed(2)}

Prodotti:
${products.map((p) => `- ${p.name} x ${p.quantity} @ €${p.price}`).join('\n')}
`;
};
