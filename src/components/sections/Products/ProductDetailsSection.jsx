'use client';

export default function ProductDetailsSection({ product }) {
  if (!product) return null;

  return (
    <section className="py-10 max-w-[1570px] mx-auto px-4 md:px-8 lg:px-10 xl:px-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
          <img
            src={product.images[0].src}
            alt={product.images[0].alt}
            className="object-contain max-h-[400px]"
          />
        </div>
        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-2xl md:text-4xl font-bold">{product.title}</h1>
          <p className="text-lg font-semibold">
            {product.volume} - {product.price} {product.currency}
          </p>

          <div className="flex flex-col gap-3">
            <button className="bg-brand-accent text-white py-3 px-6 rounded-md w-max">
              Acquista
            </button>
          </div>

          <div className="mt-4 text-text-primary">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
