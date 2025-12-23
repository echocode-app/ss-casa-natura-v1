'use client';

import React from 'react';
import BannerSection from '@/components/sections/BannerSection/BannerSection';
import Image from 'next/image';

export default function MissionPage() {
  return (
    <main>
      <BannerSection
        title="La nostra Missione"
        subtitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
        backgroundSrc="/images/pages/mission-baner.jpg"
      />

      <section className="relative overflow-x-hidden py-8 md:py-16 lg:py-24">
        <div className="relative z-10 mx-auto max-w-[1570px] px-4 md:px-10 xl:px-12 flex flex-col gap-12 lg:gap-y-24">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-x-10">
            <div className="lg:w-1/2 flex justify-center">
              <Image
                src="/images/pages/mission-img.jpg"
                alt="Mission image"
                width={846}
                height={1196}
                className="object-contain w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <p className="text-[clamp(18px,2vw,24px)] leading-[30px]">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry's standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
                It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                with desktop publishing software like Aldus PageMaker including versions of Lorem
                Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
                an unknown printer took a galley of type and scrambled it to make a type specimen
                book. It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                with desktop publishing software like Aldus PageMaker including versions of Lorem
                Ipsum.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse lg:flex-row items-center gap-6 lg:gap-x-10">
            <div className="lg:w-1/2 lg:order-2 flex justify-center">
              <Image
                src="/images/pages/mission-img.jpg"
                alt="Mission image"
                width={846}
                height={1196}
                className="object-contain w-full"
              />
            </div>
            <div className="lg:w-1/2 lg:order-1">
              <p className="text-[clamp(18px,2vw,24px)] leading-[30px]">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industry's standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
                It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                with desktop publishing software like Aldus PageMaker including versions of Lorem
                Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when
                an unknown printer took a galley of type and scrambled it to make a type specimen
                book. It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                with desktop publishing software like Aldus PageMaker including versions of Lorem
                Ipsum.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
