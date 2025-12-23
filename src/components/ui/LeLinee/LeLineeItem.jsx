import Link from 'next/link';
import Image from 'next/image';

export default function LeLineeItem({ title, imageSrc, variant = 'slider' }) {
  const isPage = variant === 'page';

  return (
    <Link href="/" className="group block w-full">
      <div
        className={`
          relative
          aspect-[505/660]
          overflow-hidden
          rounded-full
          mx-auto

          ${
            isPage
              ? `
                w-full
                max-w-[240px]
                sm:max-w-[280px]
                md:max-w-[320px]
                lg:max-w-[380px]
                xl:max-w-[420px]
              `
              : `
                w-[240px]
                md:w-[320px]
                lg:w-[290px]
                xl:w-[400px]
                shrink-0
              `
          }
        `}
      >
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes={
            isPage
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px'
              : '(max-width: 768px) 240px, (max-width: 1024px) 320px, 400px'
          }
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div
          className="
            absolute inset-0
            flex items-center justify-center
            text-text-inverse
            font-semibold
            text-[20px] sm:text-[22px] md:text-[24px] xl:text-[34px]
            leading-[1.2]
            text-center
            px-4
          "
        >
          {title}
        </div>
      </div>
    </Link>
  );
}
