import { ProductBreadcrumbs, RelatedProductsSection } from '@/components/sections/Products/Product';
import ProductMain from '@/components/sections/Products/Product/ProductMain';
import ProductNotFound from '@/components/sections/Products/ProductNotFound';
import { fetchProduct, fetchProducts } from '@/lib/utils/fetchProducts';
import { Product } from '@/config/products/product.types';
type PageProps = {
  params: { slug: string } | Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams =
    params && typeof (params as any).then === 'function' ? await (params as any) : params;
  const slug = resolvedParams?.slug;
  if (!slug) return <ProductNotFound />;

  const product = await fetchProduct(slug);
  if (!product) return <ProductNotFound />;

  const allProducts = await fetchProducts();
  const categoryId = product.categoryIds?.[0];
  const relatedProducts = categoryId
    ? allProducts.filter((p: Product) => p.categoryIds.includes(categoryId) && p.id !== product.id)
    : [];

  return (
    <>
      <ProductBreadcrumbs product={product} />
      <ProductMain product={product} />
      {relatedProducts.length > 0 ? (
        <RelatedProductsSection products={relatedProducts} />
      ) : (
        <div className="mb-20" />
      )}
    </>
  );
}
