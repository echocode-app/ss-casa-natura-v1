import Link from "next/link";

export default function Nav({ className = "" }) {
  return (
    <nav className={`uppercase font-raleway font-normal text-[clamp(1rem,1.5vw,1.125rem)] flex gap-[clamp(20px,2vw,30px)] ${className}`}>
      <Link href="/prodotti" className="py-[20px] px-[10px] hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform">Prodotti</Link>
      <Link href="/linee" className="py-[20px] px-[10px] hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform">Linee</Link>
      <Link href="/mission" className="py-[20px] px-[10px] hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform">Mission</Link>
      <Link href="/contatti" className="py-[20px] px-[10px] hover:scale-105 focus:scale-105 transition-transform duration-300 will-change-transform">Contatti</Link>
    </nav>
  );
}
