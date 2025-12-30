import { ProductFilter } from './product.types';

export const PRODUCT_FILTERS: ProductFilter[] = [
  {
    id: 'bucato',
    title: 'Bucato',
    type: 'checkbox',
    items: ['Detersivi piatti', 'Cura Lavastoviglie'],
    categoryIds: ['detersivi-piatti', 'cura-lavastoviglie'],
  },
  {
    id: 'cucina',
    title: 'Cucina',
    type: 'checkbox',
    items: ['Detersivi Bucato', 'Ammorbidenti'],
    categoryIds: ['detersivi-bucato', 'ammorbidenti'],
  },
  {
    id: 'pulizia',
    title: 'Pulizia',
    type: 'checkbox',
    items: ['Sgrassatori', 'Lavapavimenti'],
    categoryIds: ['sgrassatori', 'lavapavimenti'],
  },
];
