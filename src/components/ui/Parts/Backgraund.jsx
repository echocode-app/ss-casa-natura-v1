import Image from 'next/image';

export default function Background({ className = '' }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <div className="absolute bottom-0 w-full hiden md:h-1/2 z-0 bg-brand-light" />

      {/* wave */}
      <div className="hidden md:absolute top-0 left-0 w-full z-0">
        <Image
          src="/images/parts/wave.svg"
          alt=""
          width={1900}
          height={1480}
          className="w-full h-auto"
          priority={false}
        />
      </div>
    </div>
  );
}
