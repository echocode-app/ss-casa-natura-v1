import { ProductFilter } from './product.types';

export const PRODUCT_FILTERS: ProductFilter[] = [
  {
    id: 'bucato',
    title: 'Bucato',
    type: 'checkbox',
    items: ['Detersivi piatti', 'Cura lavastoviglie'],
  },
  {
    id: 'cucina',
    title: 'Cucina',
    type: 'checkbox',
    items: ['Detersivi bucato', 'Ammorbidenti'],
  },
  {
    id: 'pulizia',
    title: 'Pulizia',
    type: 'checkbox',
    items: ['Sgrassatori', 'Lavapavimenti'],
  },
];
