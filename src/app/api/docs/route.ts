import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Casa Natura API',
      version: '1.0.0',
    },
  },
  apis: ['./src/app/api/**/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export const GET = () => {
  return NextResponse.json(specs);
};
