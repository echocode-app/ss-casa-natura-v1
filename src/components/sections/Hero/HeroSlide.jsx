'use client';

import PrimaryButton from '@/components/ui/Buttons/PrimaryButton';

export default function HeroSlide({ image, title, subtitle, cta }) {
  return (
    <div className="relative w-full min-h-[80svh] flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-[#2B2929]" />
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-[100%] sm:max-w-[300px]
    md:max-w-[680px]
    lg:max-w-[950px]
    xl:max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-20 text-primary"
      >
        {/* SEO */}
        <h1 className="sr-only">CASA NATURA</h1>

        <h2
          className="
            font-raleway font-bold
            text-[clamp(32px,6vw,88px)]
            leading-[1.2]
                max-w-[300px]
    sm:max-w-[400px]
    md:max-w-[640px]
    lg:max-w-[720px]
    xl:max-w-[900px]
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-6
            font-raleway font-normal
            text-[clamp(16px,2.5vw,27px)]
            max-w-[240px]
    sm:max-w-[260px]
    md:max-w-[320px]
    lg:max-w-[380px]
    xl:max-w-[420px]
            
          "
        >
          {subtitle}
        </p>

        <div className="mt-10">
          <PrimaryButton>{cta}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
