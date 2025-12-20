'use client';

import GreenProductionMobile from './GreenProductionMobile';
import GreenProductionDesktop from './GreenProductionDesktop';

export default function GreenProductionSection() {
  return (
    <section className="py-6 md:py-16 xl:py-24">
      <div className="mx-auto max-w-[1100px] px-6 md:px-8 lg:px-10 xl:px-12">
        <h2 className="text-center text-[clamp(24px,2vw,47px)] leading-[1.1] mb-12 xl:mb-16">
          Perché siamo <span className="font-bold">green</span>?
        </h2>

        <GreenProductionMobile />
        <GreenProductionDesktop />
      </div>
    </section>
  );
}
