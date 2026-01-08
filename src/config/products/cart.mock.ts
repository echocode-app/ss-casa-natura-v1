import { PRODUCTS_MOCK } from '@/config/products/products.mock';

export const CART_MOCK = [
  {
    id: PRODUCTS_MOCK[0].id,
    title: PRODUCTS_MOCK[0].title,
    imageSrc: PRODUCTS_MOCK[0].images?.[0]?.src,
    price: PRODUCTS_MOCK[0].price,
    volume: PRODUCTS_MOCK[0].variants?.[0]?.volume,
    unit: PRODUCTS_MOCK[0].variants?.[0]?.unit,
    quantity: 1,
  },
  {
    id: PRODUCTS_MOCK[1].id,
    title: PRODUCTS_MOCK[1].title,
    imageSrc: PRODUCTS_MOCK[1].images?.[0]?.src,
    price: PRODUCTS_MOCK[1].price,
    volume: PRODUCTS_MOCK[1].variants?.[0]?.volume,
    unit: PRODUCTS_MOCK[1].variants?.[0]?.unit,
    quantity: 2,
  },
  {
    id: PRODUCTS_MOCK[2].id,
    title: PRODUCTS_MOCK[2].title,
    imageSrc: PRODUCTS_MOCK[2].images?.[0]?.src,
    price: PRODUCTS_MOCK[2].price,
    volume: PRODUCTS_MOCK[2].variants?.[0]?.volume,
    unit: PRODUCTS_MOCK[2].variants?.[0]?.unit,
    quantity: 1,
  },
];
