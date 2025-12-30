import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ title, href = '/products' }) {
  return (
    <Link href={href} className="group flex flex-col items-center text-center cursor-pointer">
      {/* Image wrapper */}
      <div className="relative flex items-center justify-center p-0 md:p-4">
        {/* Circle */}
        <div
          className="absolute rounded-full z-1 
          bg-brand-accent overflow-hidden 
          transition-all duration-300
          group-hover:shadow-header
          group-focus:outline-none group-focus:shadow-header
          w-[220px] lg:w-[260px] xl:w-[326px]
          h-[220px] lg:h-[260px] xl:h-[326px]"
          style={{
            top: '60%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Image */}
        <Image
          src="/images/home/products.png"
          alt={title}
          width={256}
          height={342}
          className="relative z-2 w-[180px] lg:w-[220px] xl:w-[256px] h-auto"
        />
      </div>
      {/* Title + Arrow */}
      <div className="mt-6 flex items-center gap-5 z-5">
        <span className="text-[clamp(18px,2vw,30px)]">{title}</span>
        <span
          className="relative z-6 flex items-center justify-center
          bg-brand-accent rounded-full 
          p-[clamp(6px,2vw,8px)] 
          md:group-hover:translate-x-2
          transition-all duration-300
          group-hover:shadow-header group-hover:opacity-90
          group-focus:outline-none group-focus:shadow-header "
        >
          <Image
            src="/images/parts/arrow.svg"
            alt="Arrow"
            width={20}
            height={20}
            className="w-[clamp(14px,4vw,18px)] h-[clamp(14px,4vw,18px)] xl:w-[20px] xl:h-[20px]"
          />
        </span>
      </div>
    </Link>
  );
}
