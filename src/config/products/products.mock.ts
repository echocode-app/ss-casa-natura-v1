import { Product } from './product.types';

const DEFAULT_IMAGE = '/images/home/product.png';

// Empty mock array - all products are now in MongoDB
// This file is kept for development purposes only
export const PRODUCTS_MOCK: Product[] = [];

// Re-export DEFAULT_IMAGE for fallback usage
export { DEFAULT_IMAGE };
