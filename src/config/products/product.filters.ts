import { ProductFilter } from './product.types';

export const PRODUCT_FILTERS: ProductFilter[] = [
  { id: 'eco', title: 'Eco', type: 'checkbox' },
  { id: 'new', title: 'Novità', type: 'checkbox' },
  { id: 'best-seller', title: 'Best seller', type: 'checkbox' },
  { id: 'volume', title: 'Formato', type: 'radio' },
];
