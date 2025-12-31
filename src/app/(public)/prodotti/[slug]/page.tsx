import { notFound } from 'next/navigation';
import ProductDetailsSection from '@/components/sections/Products/ProductDetailsSection';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

interface PageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: PageProps) {
  const product = PRODUCTS_MOCK.find((p) => p.slug === params.slug);

  if (!product) return notFound();

  return (
    <main>
      {/* ================= */}
      <section className="py-5 lg:py-7">
        <div className="flex flex-wrap gap-2 items-center max-w-[1570px] mx-auto px-6 md:px-8 lg:px-10 xl:px-12 text-[clamp(14px,2vw,17px)] leading-[clamp(24px,2vw,31px)] text-text-primary">
          <span>
            <a href="/" className="transition-all duration-300 hover:underline">
              Home
            </a>
          </span>
          <span className="text-text-primary">|</span>
          <span>
            <a href="/prodotti" className="transition-all duration-300 hover:underline">
              {product.categoryIds.map((cat) => cat).join(', ')}
            </a>
          </span>
          <span className="text-text-primary">|</span>
          <span className="text-[#545454] underline">{product.title}</span>
        </div>
      </section>

      {/* ================= */}
      <ProductDetailsSection product={product} />
    </main>
  );
}
