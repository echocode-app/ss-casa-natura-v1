import fs from 'node:fs';
import path from 'node:path';

let swaggerSpec: any;

try {
  const filePath = path.join(process.cwd(), 'docs', 'openapi.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  swaggerSpec = JSON.parse(raw);
} catch {
  swaggerSpec = {
    openapi: '3.1.0',
    info: {
      title: 'Casa Natura API',
      version: '1.0.0',
      description: 'API for Casa Natura e-commerce (fallback spec).',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    paths: {},
  };
}

export default swaggerSpec;
