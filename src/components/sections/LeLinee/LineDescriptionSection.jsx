'use client';

import Image from 'next/image';

export default function LineDescriptionSection({ imageSrc, title, subtitle }) {
  return (
    <section className="flex flex-col lg:flex-row items-start max-w-[1570px] mx-auto px-4 md:px-8 py-16 gap-8">
      {/* Image */}
      <div className="w-full lg:w-1/2 relative aspect-square lg:h-[500px] xl:h-[550px] order-2 lg:order-1">
        <Image src={imageSrc} alt={title} fill className="object-cover" />
      </div>

      {/* Text block: Title + Subtitle */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-start order-1 lg:order-2">
        <h3 className="text-[clamp(30px,5vw,47px)] leading-[clamp(30px,5vw,50px)] mb-4 md:mb-8 lg:mb-16 text-left">
          {title}
        </h3>
        <p className="text-[clamp(18px,2vw,24px)] leading-[31px] text-left">{subtitle}</p>
      </div>
    </section>
  );
}
