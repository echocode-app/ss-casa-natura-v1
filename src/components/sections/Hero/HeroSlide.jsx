'use client';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function HeroSlide({ image, title, subtitle, cta }) {
  return (
    <div className="relative w-full min-h-[78svh] flex items-center overflow-x-hidden">
      <div className="absolute inset-0" />
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover" />

      <div className="relative z-10 w-full max-w-[1570px] mx-auto pr-6 pl-10 md:pl-24 lg:pl-26 xl:pl-28">
        {/* Content —  */}
        <div className="text-primary">
          <h1 className="sr-only">CASA NATURA</h1>

          <h2
            className="
          font-raleway font-bold
          text-[clamp(32px,6vw,88px)]
          max-w-[890px]
          leading-[0.95]
        "
          >
            {title}
          </h2>

          <p
            className="
          mt-6
          font-raleway
          text-[clamp(16px,2.5vw,27px)]
          max-w-[400px]
        "
          >
            {subtitle}
          </p>

          <div className="mt-8 sm:mt-10">
            <PrimaryButton
              className="        
              px-6 py-3
        md:px-8 md:py-4
        lg:px-12 lg:py-5
        xl:px-16 xl:py-6"
            >
              {cta}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
