import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Documentazione API in formato OpenAPI 3.1
 *     description: Restituisce la specifica OpenAPI completa dell'API Casa Natura
 *     tags: [Docs]
 *     responses:
 *       200:
 *         description: Specifica OpenAPI 3.1 JSON
 */
export const GET = () => {
  try {
    // Lazy import per evitare errori di compilazione
    const swaggerSpec = require('@/lib/swagger').default;
    return NextResponse.json(swaggerSpec);
  } catch {
    // Fallback: specifica minima se swagger-jsdoc fallisce
    return NextResponse.json({
      openapi: '3.1.0',
      info: {
        title: 'Casa Natura API',
        version: '1.0.0',
        description: 'API per il sistema di e-commerce Casa Natura',
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          description: 'API Server',
        },
      ],
      paths: {
        '/api/products': {
          get: {
            summary: 'Lista prodotti',
            tags: ['Products'],
          },
        },
        '/api/categories': {
          get: {
            summary: 'Lista categorie',
            tags: ['Categories'],
          },
        },
        '/api/cart': {
          get: {
            summary: 'Carrello corrente',
            tags: ['Cart'],
          },
        },
      },
    });
  }
};
