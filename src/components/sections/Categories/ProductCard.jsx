import ProductCard from './ProductCard';
import Image from 'next/image';

export default function CategoriesSection() {
  const products = ['Pulizia', 'Bucato', 'Cucina'];

  return (
    <section className="py-4 md:py-6 xl:py-12">
      <div className="mx-auto max-w-[1570px] px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-[720px] mx-auto mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-[clamp(24px,2vw,40px)]">Benvenuti nel mondo di Casa Natura</h2>
          <p className="font-bold text-[clamp(24px,2vw,40px)]">Scopri i nostri prodotti</p>
        </div>

        {/* Cards */}
        <div
          className="
            flex flex-nowrap justify-center
            gap-0 md:gap-4 lg:gap-8
            overflow-x-auto snap-x snap-mandatory pb-4

            lg:grid lg:grid-cols-3 lg:justify-items-center lg:overflow-visible lg:snap-none lg:pb-0
          "
        >
          {products.map((title, index) => (
            <div key={title} className="snap-start shrink-0 lg:shrink relative">
              {/* Leaf for first and last card */}
              {index === 0 && (
                <Image
                  src="/images/home/leaf.png"
                  alt="Leaf"
                  width={150}
                  height={150}
                  className="absolute -top-8 -left-8 lg:w-[190px] xl:w-[280px] lg:-top-10 lg:-left-10 xl:-top-12 xl:-left-12"
                />
              )}
              {index === products.length - 1 && (
                <Image
                  src="/images/home/leaf.png"
                  alt="Leaf"
                  width={150}
                  height={150}
                  className="absolute -top-8 -right-8 lg:w-[190px] xl:w-[280px] lg:-top-10 lg:-right-10 xl:-top-12 xl:-right-12 scale-x-[-1]"
                />
              )}

              <ProductCard title={title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
