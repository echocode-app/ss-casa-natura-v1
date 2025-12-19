'use client';

import Image from 'next/image';
import PrimaryButton from '../Buttons/PrimaryButton';
import Link from 'next/link';

export default function ProductCard({
  title = 'Sgrassatore naturale Agrumi di Sicilia',
  volume = 'ml 750',
  price = '€ 10.00',
  imageSrc = '/images/home/product.png',
  onAddClick,
}) {
  return (
    <Link
      href="/"
      className="
        bg-background-primary 
        rounded-[20px] 
        flex flex-col 
        p-3 md:p-4 lg:p-5 xl:p-6 
        gap-1 md:gap-2 lg:gap-3 xl:gap-4
        h-full
        border border-bg-brand-soft
      "
    >
      {/* Image */}
      <div className="w-full flex justify-center overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          width={180}
          height={240}
          className="
            object-contain
          "
        />
      </div>

      {/* Text info */}
      <div className="flex flex-col gap-[clamp(6px,2vw,10px)] flex-1">
        <h3 className="font-semibold text-[clamp(16px,2vw,26px)]">{title}</h3>
        <span className="font-normal text-[clamp(12px,2vw,20px)]">{volume}</span>
        <span className="font-semibold text-[clamp(14px,2vw,22px)]">{price}</span>
      </div>

      {/* Button */}
      <div className="flex justify-center mt-auto px-2">
        <PrimaryButton
          onClick={onAddClick}
          className="w-full 
                px-2 py-4
                xl:py-6

                md:px-4
                lg:px-6
                xl:px-8
                text-center"
        >
          Aggiungi
        </PrimaryButton>
      </div>
    </Link>
  );
}
