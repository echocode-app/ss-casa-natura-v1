import WaveBackground from '@/components/ui/Parts/WaveBackground';
import ProductCard from '@/components/ui/Products/ProductCard';

const products = Array.from({ length: 8 }, (_, i) => ({ id: i + 1 }));

export default function TopProductsSection() {
  return (
    <section className="py-16 xl:py-20 relative overflow-hidden ">
      <WaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-12 md:mb-16 xl:mb-20">
          I nostri prodotti più <span className="heading-accent">amati</span>
        </h2>

        {/* Grid */}
        <div
          className="
            grid 
            grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-4 
            gap-x-[clamp(10px,2vw,30px)]
            gap-y-[clamp(10px,2vw,30px)]
          "
        >
          {products.map((product) => (
            <ProductCard key={product.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
