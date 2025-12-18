import Link from 'next/link';
import { Close } from '@/components/ui/Buttons';

export default function MobileMenu({ closeMenu }) {
  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={closeMenu} />

      {/* Panel */}
      <div
        className="
          absolute top-0 left-0
          h-full
          w-[30vw] min-w-[200px]
          bg-background-primary
          flex flex-col
          pt-20 px-4 gap-4
          shadow-md
          animate-slide-in
        "
      >
        {/* Close */}
        <button
          onClick={closeMenu}
          aria-label="Close menu"
          className="absolute top-4 right-4 hover:scale-105 transition-transform will-change-transform"
        >
          <Close />
        </button>

        <nav className="flex flex-col gap-8">
          <Link href="/prodotti" onClick={closeMenu}>
            Prodotti
          </Link>
          <Link href="/linee" onClick={closeMenu}>
            Linee
          </Link>
          <Link href="/mission" onClick={closeMenu}>
            Mission
          </Link>
          <Link href="/contatti" onClick={closeMenu}>
            Contatti
          </Link>
        </nav>
      </div>
    </div>
  );
}
