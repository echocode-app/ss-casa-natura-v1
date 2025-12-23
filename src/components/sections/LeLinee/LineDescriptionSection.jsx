'use client';

import Image from 'next/image';

export default function LineDescriptionSection({ imageSrc, title, subtitle }) {
  return (
    <section className="flex flex-col lg:flex-row items-center max-w-[1570px] mx-auto px-4 md:px-8 py-16 gap-8">
      {/* Image */}
      <div className="w-full lg:w-1/2 relative h-[300px] md:h-[400px] lg:h-[500px] xl:h-[550px]">
        <Image src={imageSrc} alt={title} fill className="object-cover rounded-[20px]" />
      </div>

      {/* Text */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center">
        <h3 className="heading-sm lg:heading-lg xl:heading-xl mb-6">{title}</h3>
        <p className="text-[clamp(18px,2vw,24px)] leading-[30px]">{subtitle}</p>
      </div>
    </section>
  );
}
