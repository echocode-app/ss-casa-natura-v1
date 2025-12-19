import Image from 'next/image';

export default function Arrow() {
  return (
    <span
      aria-label="Arrow"
      className="
        inline-flex items-center justify-center
        w-[28px] h-[28px]
        md:w-[28px] md:h-[28px]
        lg:w-[32px] lg:h-[32px]
        xl:w-[34px] xl:h-[34px]
        md:focus:scale-105
        md:transition-transform md:duration-400
      "
    >
      <Image src="/images/parts/arrow.svg" alt="Arrow" width={34} height={34} />
    </span>
  );
}
