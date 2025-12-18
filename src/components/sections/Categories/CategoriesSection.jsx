import ProductCard from './ProductCard';

export default function CategoriesSection() {
  return (
    <section className="py-4 md:py-6 xl:py-12">
      <div className="mx-auto max-w-[1570px] px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-[720px] mx-auto ">
          <h2 className="text-[clamp(24px,2vw,40px)]">Benvenuti nel mondo di Casa Natura</h2>
          <p className="font-bold text-[clamp(24px,2vw,40px)]">Scopri i nostri prodotti</p>
        </div>

        {/* Cards */}
        <div
          className="
    mt-6 md:mt-10 lg:mt-16

    flex gap-0
    overflow-x-auto
    snap-x snap-mandatory
    pb-2

    md:gap-2

    lg:grid
    lg:grid-cols-3
    lg:gap-8
    lg:overflow-visible
    lg:snap-none
    lg:pb-0
      "
        >
          <div className="snap-start shrink-0 lg:shrink">
            <ProductCard title="Pulizia" />
          </div>

          <div className="snap-start shrink-0 lg:shrink">
            <ProductCard title="Bucato" />
          </div>

          <div className="snap-start shrink-0 lg:shrink">
            <ProductCard title="Cucina" />
          </div>
        </div>
      </div>
    </section>
  );
}
