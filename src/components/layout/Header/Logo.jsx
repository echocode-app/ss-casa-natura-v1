import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ isScrolled = false, className = '' }) {
  return (
    <Link
      href="/"
      aria-label="Home"
      className={`
        relative
        transition-all duration-500 ease-out

        w-[88px] h-[61px]

        md:w-[121px] ${isScrolled ? 'md:h-[50px]' : 'md:h-[84px]'}

        lg:w-[198px] ${isScrolled ? 'lg:h-[80px]' : 'lg:h-[138px]'}

        xl:w-[220px] ${isScrolled ? 'xl:h-[90px]' : 'xl:h-[153px]'}

        ${className}
      `}
    >
      <Image
        src="/images/parts/logo.svg"
        alt="CASA NATURA"
        fill
        className="object-contain"
        priority
      />
    </Link>
  );
}
