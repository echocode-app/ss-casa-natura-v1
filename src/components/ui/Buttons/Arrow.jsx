import Image from 'next/image';

export default function Arrow() {
  return (
    <span
      aria-label="Arrow"
      className="
        inline-flex items-center justify-center
        w-[20px] h-[20px]
        md:w-[22px] md:h-[22px]
        lg:w-[28px] lg:h-[28px]
        xl:w-[34px] xl:h-[34px]
        md:focus:scale-105
        md:transition-transform md:duration-400
      "
    >
      <Image src="/images/parts/arrow.svg" alt="Arrow" width={34} height={34} />
    </span>
  );
}
