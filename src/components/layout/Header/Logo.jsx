import Image from 'next/image';
import Link from 'next/link';

export default function Logo({ className = '' }) {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="relative w-[20vw] h-[90px] md:h-[100px] lg:h-[110px] xl:h-[120px]"
    >
      <Image
        src="/images/parts/logo.svg"
        alt="CASA NATURA"
        fill
        className={`object-contain ${className}`}
        priority
      />
    </Link>
  );
}
