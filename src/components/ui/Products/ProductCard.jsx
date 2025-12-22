'use client';

import Image from 'next/image';
import { PrimaryButton, CartIcon } from '@/components/ui/Buttons';
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
        group
        bg-white/90
        rounded-[20px] 
        flex flex-col 
        p-2 md:p-4 lg:p-5 xl:p-6 
        gap-1 md:gap-2 lg:gap-3 xl:gap-4
        h-full
        border
        border-bg-brand-soft
        md:border-none
        transition-all duration-300
      "
    >
      {/* Image */}
      <div className="w-full flex justify-center rounded-[16px]">
        <Image
          src={imageSrc}
          alt={title}
          width={180}
          height={240}
          className="
            object-contain
            transition-transform duration-300 ease-out
            md:group-hover:scale-110
          "
        />
      </div>

      {/* Text info */}
      <div className="flex flex-col gap-[clamp(6px,2vw,10px)] flex-1">
        <h3 className="font-semibold text-[clamp(16px,2vw,26px)]">{title}</h3>

        {/* Volume + Price + Button */}
        <div className="flex flex-col lg:flex-col gap-1 mt-2">
          <div className="flex justify-between lg:flex-col">
            {/* Volume + Price */}
            <div className="flex flex-col gap-2 justify-center">
              <span className="font-normal text-[clamp(12px,2vw,20px)]">{volume}</span>
              <span className="font-semibold text-[clamp(14px,2vw,22px)]">{price}</span>
            </div>

            {/* Button */}
            <div className="mt-0 lg:mt-2">
              <PrimaryButton
                onClick={onAddClick}
                className="
                  w-full 
                  px-3 py-3
                  md:px-4 md:py-3
                  lg:px-6 xl:px-8 xl:py-5
                  text-center
                  flex justify-center items-center
                  gap-2
                "
              >
                <span className="md:hidden">
                  <CartIcon
                    className="md:hidden
                  m-auto p-1"
                  />
                </span>

                <span className="hidden md:inline">Aggiungi</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
