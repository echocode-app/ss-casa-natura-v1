import Link from 'next/link';
import Image from 'next/image';

export default function LeLineeItem({ title, imageSrc }) {
  return (
    <Link href="/" className="group">
      <div
        className="
          relative
          w-[240px] md:w-[320px] lg:w-[290px] xl:w-[400px]
          aspect-[505/660]
          overflow-hidden
          rounded-full
          shrink-0 mx-auto
        "
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 240px, (max-width: 1024px) 320px, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div
          className="
            absolute inset-0
            flex items-center justify-center
            text-text-inverse
            font-semibold
            text-[24px] md:text-[28px] xl:text-[35px]
            leading-[31px]
            text-center
          "
        >
          {title}
        </div>
      </div>
    </Link>
  );
}
