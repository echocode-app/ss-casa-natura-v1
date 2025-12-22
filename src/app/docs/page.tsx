'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  return (
    <div style={{ height: '100vh' }}>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}

// http://localhost:3000/docs

// Swagger JSON:
// http://localhost:3000/api/docs
