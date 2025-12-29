import { ProductCategory } from './product.types';

const DEFAULT_CATEGORY_IMAGE = '/images/categories/products.png';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'detersivi-piatti',
    title: 'Detersivi piatti',
    image: '/images/categories/products.png',
  },
  {
    id: 'cura-lavastoviglie',
    title: 'Cura lavastoviglie',
  },
  {
    id: 'detersivi-bucato',
    title: 'Detersivi bucato',
  },
  {
    id: 'ammorbidenti',
    title: 'Ammorbidenti',
  },
  {
    id: 'sgrassatori',
    title: 'Sgrassatori',
  },
  {
    id: 'lavapavimenti',
    title: 'Lavapavimenti',
  },
].map((category) => ({
  ...category,
  image: category.image || DEFAULT_CATEGORY_IMAGE,
}));
