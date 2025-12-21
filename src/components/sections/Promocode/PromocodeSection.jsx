'use client';

import React from 'react';
import PromocodeForm from './PromocodeForm';
import Image from 'next/image';

export default function PromocodeSection() {
  return (
    <section className="relative overflow-hidden py-40 xl:pt-48">
      {/* CONTAINER */}
      <div className="relative mx-auto max-w-[1440px] px-4 md:px-8 lg:px-10 xl:px-12">
        {/* DECOR IMAGES */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Foam */}
          <div
            className="
              absolute
              top-[-60px]
              left-[20px]


              w-[300px] h-[270px]
              md:w-[470px] md:h-[420px]
              lg:w-[420px] lg:h-[380px]

              z-0 md:z-0 xl:z-20
            "
          >
            <Image
              src="/images/home/foam.jpg"
              alt="Foam"
              fill
              className="object-cover rounded-[120px]"
              priority
            />
          </div>

          {/* Leafs */}
          <div
            className="
              absolute
              top-[160px]
              left-[160px]

              w-[300px] h-[270px]
              md:w-[470px] md:h-[420px]
              lg:w-[420px] lg:h-[380px]

              z-0 md:z-0 xl:z-30
            "
          >
            <Image
              src="/images/home/leafs.png"
              alt="Leafs"
              fill
              className="object-cover rounded-[120px]"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex justify-center xl:justify-end">
          <div
            className="
              w-full
              max-w-[600px]
              md:max-w-[700px]
              lg:max-w-[900px]
              xl:max-w-[1000px]

              bg-background-grizzly
              rounded-[120px] xl:rounded-[223px]

              p-8 md:p-10 lg:p-12 lg:pb-10
            "
          >
            <h3 className="heading-sm heading-lg font-semibold mb-2 text-center">
              Unisciti alla nostra community e ricevi subito
              <br />
              il 10% di sconto!
            </h3>

            <p className="text-[clamp(16px,2vw,24px)] leading-[1.2] text-center mb-4 lg:mb-8">
              Offerte esclusive, nuovi prodotti e molto altro –
              <br />
              direttamente nella tua casella di posta
            </p>

            <PromocodeForm />
          </div>
        </div>
      </div>
    </section>
  );
}
