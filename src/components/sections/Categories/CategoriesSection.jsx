import Image from 'next/image';
import ProductCard from './ProductCard';
import Leaf from '/public/images/home/leaf.png';
import LeafR from '/public/images/home/leaf-right.png';

export default function CategoriesSection() {
  return (
    <section className="py-4 md:py-6 xl:py-12 relative overflow-hidden">
      <div className="mx-auto max-w-[1570px] px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="text-center max-w-[720px] mx-auto">
          <h2 className="heading-sm lg:heading-lg">Benvenuti nel mondo di Casa Natura</h2>
          <p className="text-[30px] lg:text-[40px] font-bold">Scopri i nostri prodotti</p>
        </div>

        {/* Cards */}
        <div
          className="
          lg:max-w-[1000px] xl:max-w-[1200px] 
          mx-auto
            mt-6 md:mt-10 lg:mt-16
            flex flex-col items-center gap-6
            md:flex-row md:justify-center md:gap-8
            lg:grid lg:grid-cols-3
            relative"
        >
          <div className="relative snap-start shrink-0 lg:shrink">
            <Image
              src={Leaf}
              alt="Leaf"
              width={419}
              height={270}
              className="
                absolute 
                top-2 right-28
                lg:-top-4 lg:-left-40
                xl:-top-6 xl:-left-48
                z-0 overflow-x-hidden
              "
            />
            <ProductCard title="Pulizia" />
          </div>

          <div className="relative snap-start shrink-0 lg:shrink mt-6 md:mt-0">
            <ProductCard title="Bucato" />
          </div>

          <div className="relative snap-start shrink-0 lg:shrink mt-6 md:mt-0">
            <Image
              src={LeafR}
              alt="Leaf-right"
              width={403}
              height={255}
              className="
                absolute 
                top-2 -right-28
                lg:-top-4 lg:-right-36
                xl:-top-8 xl:-right-44
                z-0 overflow-x-hidden
              "
            />
            <ProductCard title="Cucina" />
          </div>
        </div>
      </div>
    </section>
  );
}
