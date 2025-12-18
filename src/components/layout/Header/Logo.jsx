import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "" }) {
  return (
    <Link href="/" aria-label="Home" className="relative w-[20vw] h-[110px] md:h-[120px] lg:h-[130px] xl:h-[140px] hover:scale-105 transition-transform duration-700 will-change-transform">
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