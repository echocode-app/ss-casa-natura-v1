'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white px-4 md:px-8 py-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">API Documentation</h1>
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <SwaggerUI url="/api/docs" docExpansion="none" deepLinking />
        </div>
      </div>
    </main>
  );
}
