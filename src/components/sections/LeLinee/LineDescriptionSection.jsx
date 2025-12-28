'use client';

import Image from 'next/image';

export default function LineDescriptionSection({ imageSrc, title, subtitle }) {
  return (
    <section className="pb-16 xl:pb-20">
      <div
        className="
    flex flex-col lg:flex-row justify-between items-start 
    max-w-[1570px] mx-auto 
    px-6 md:px-8 lg:px-10 xl:px-12 
    gap-8 lg:gap-16"
      >
        {/* Image */}
        <div className="w-full lg:w-1/2 relative aspect-square lg:h-[500px] xl:h-[700px] order-2 lg:order-1">
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 770px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Text block: Title + Subtitle */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start order-1 lg:order-2">
          <h3 className="text-[clamp(30px,5vw,47px)] leading-[clamp(30px,5vw,50px)] mb-8 md:mb-10 lg:mb-16 text-left">
            {title}
          </h3>
          <p className="text-[clamp(18px,2vw,24px)] leading-[31px] text-left text-[#505150]">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
