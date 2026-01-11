import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Casa Natura API',
      version: '1.0.0',
      description: 'API per il sistema di e-commerce Casa Natura',
      contact: {
        name: 'Casa Natura',
        url: 'https://casa-natura.com',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    tags: [
      { name: 'Products', description: 'Endpoints per i prodotti' },
      { name: 'Categories', description: 'Endpoints per le categorie' },
      { name: 'Cart', description: 'Endpoints per il carrello' },
      { name: 'Orders', description: 'Endpoints per gli ordini' },
      { name: 'Users', description: 'Endpoints per gli utenti' },
      { name: 'Auth', description: "Endpoints per l'autenticazione" },
      { name: 'Admin', description: 'Endpoints amministrativi' },
      { name: 'Mailchimp', description: "Endpoints per l'integrazione Mailchimp" },
    ],
  },
  // Спрощений підхід: не використовуємо glob pattern
  apis: [],
};

let swaggerSpec;

try {
  swaggerSpec = swaggerJSDoc(options);
} catch {
  // Fallback якщо swagger-jsdoc не працює
  swaggerSpec = options.definition;
}

export default swaggerSpec;
