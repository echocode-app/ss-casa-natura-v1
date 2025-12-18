import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ className = '' }) {
  return (
    <Link
      href="/"
      aria-label="Home"
      className={`
        relative
        w-[88px] h-[61px]       /* sm */
        md:w-[121px] md:h-[84px] /* md */
        lg:w-[198px] lg:h-[138px] /* lg */
        xl:w-[220px] xl:h-[153px] /* xl */
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
