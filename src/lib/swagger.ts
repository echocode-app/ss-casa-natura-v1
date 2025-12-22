import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Casa Natura API',
      version: '1.0.0',
    },
  },
  apis: ['./src/app/api/**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
