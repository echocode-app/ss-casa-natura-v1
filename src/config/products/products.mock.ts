import { Product } from './product.types';

export const PRODUCTS_MOCK: Product[] = [
  {
    id: '1',
    slug: 'eco-piatti-limone',
    title: 'Detersivo Piatti al Limone',
    categoryId: 'cucina',
    lineId: 'lavanda',
    images: [{ src: '/images/products/piatti-limone.png', alt: 'Detersivo piatti al limone' }],
    volume: '750 ml',
    price: 3.9,
    currency: 'EUR',
    isEco: true,
    isNew: true,
    filters: [
      { filterId: 'eco', value: true },
      { filterId: 'volume', value: '750 ml' },
    ],
  },
];
