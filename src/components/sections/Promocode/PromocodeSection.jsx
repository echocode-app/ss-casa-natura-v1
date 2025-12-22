'use client';

import React from 'react';
import PromocodeForm from './PromocodeForm';
import Image from 'next/image';

export default function PromocodeSection() {
  return (
    <section className="relative overflow-x-hidden py-40 xl:pt-48">
      {/* CONTAINER */}
      <div className="relative mx-auto max-w-[768px] lg:max-w-[1024px] xl:max-w-[1440px] px-4 md:px-8 lg:px-10 xl:px-12">
        {/* DECOR IMAGES */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Foam */}
          <div
            className="
              absolute
              top-[-30%]
              left-[-20%]   
              lg:top-[-100px]
              lg:left-[20px]   
              xl:top-[-60px]
              xl:left-[20px]
              w-[300px] h-[270px]
              md:w-[340px] md:h-[300px]
              lg:w-[380px] lg:h-[340px]
              xl:w-[420px] xl:h-[380px]
              z-0 md:z-0 xl:z-20
            "
          >
            <Image
              src="/images/home/foam.jpg"
              alt="Foam"
              fill
              sizes="(max-width: 768px) 300px, (max-width: 1024px) 380px, 420px"
              className="object-cover rounded-[60px] xl:rounded-[120px]"
              priority
            />
          </div>

          {/* Leafs */}
          <div
            className="
              absolute
              top-[50%] 
              left-[75%]   
              lg:top-[180px]
              lg:left-[630px]
              xl:top-[160px]
              xl:left-[160px]
              w-[300px] h-[270px]
              md:w-[340px] md:h-[300px]
              lg:w-[380px] lg:h-[340px]
              xl:w-[420px] xl:h-[380px]
              z-0 md:z-0 xl:z-30
            "
          >
            <Image
              src="/images/home/leafs.png"
              alt="Leafs"
              fill
              sizes="(max-width: 768px) 300px, (max-width: 1024px) 380px, 420px"
              className="object-cover rounded-[60px] xl:rounded-[120px]"
            />
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative z-10 flex justify-center lg:justify-end">
          <div
            className="
              w-full
              max-w-[600px]
              md:max-w-[700px]
              lg:max-w-[800px]
              xl:max-w-[1000px]
              bg-opacity-80
              transition-all duration-300 ease-out
              hover:bg-opacity-100
              xl:bg-opacity-100
              bg-background-grizzly
              rounded-[60px] lg:rounded-[120px] xl:rounded-[223px]
              p-8 md:p-10 lg:p-12 lg:pb-10
            "
          >
            <h3 className="heading-default heading-sm heading-lg font-semibold mb-2 text-center">
              Unisciti alla nostra community e ricevi subito
              <br className="hidden md:block" />
              il 10% di sconto!
            </h3>

            <p className="text-[clamp(16px,2vw,24px)] leading-[1.2] text-center mb-4 lg:mb-8">
              Offerte esclusive, nuovi prodotti e molto altro – <br className="hidden md:block" />
              direttamente nella tua casella di posta
            </p>

            <PromocodeForm />
          </div>
        </div>
      </div>
    </section>
  );
}
