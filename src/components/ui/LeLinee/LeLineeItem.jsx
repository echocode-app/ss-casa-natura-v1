import Link from 'next/link';
import Image from 'next/image';

export default function LeLineeItem({ title, imageAlt = '', imageSrc, slug, variant = 'slider' }) {
  const isPage = variant === 'page';

  return (
    <Link href={`/linee/${slug}`} className="group block w-full">
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
        {/* IMAGE */}
        <Image
          src={imageSrc}
          alt={imageAlt || title}
          fill
          sizes={
            isPage
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 340px'
              : '(max-width: 768px) 240px, (max-width: 1024px) 320px, 400px'
          }
          className="object-cover transition-transform duration-700 md:group-hover:scale-110"
        />

        {/* OVERLAY (md+) */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            bg-white/70
            opacity-0
            transition-opacity
            duration-500
            md:group-hover:opacity-100
          "
        />

        {/* TITLE */}
        <div
          className="
            absolute inset-0 z-10
            flex items-center justify-center
            text-text-inverse
            font-semibold
            text-[clamp(22px,2vw,34px)]
            leading-[1.2]
            text-center
            px-4
            transition-colors
            duration-300
            md:group-hover:text-[#5A5A5A]
          "
        >
          {title}
        </div>
      </div>
    </Link>
  );
}
