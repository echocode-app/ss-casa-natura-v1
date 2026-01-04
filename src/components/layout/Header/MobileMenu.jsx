import Link from 'next/link';
import { Close } from '@/components/ui/Buttons';
import { useTranslations } from 'next-intl';

export default function MobileMenu({ closeMenu }) {
  const t = useTranslations('header.nav');
  const actions = useTranslations('header.actions');
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
          aria-label={actions('closeMenu')}
          className="absolute top-4 right-4 transition-transform will-change-transform"
        >
          <Close />
        </button>

        <nav className="flex flex-col gap-8">
          <Link href="/prodotti" onClick={closeMenu}>
            {t('products')}
          </Link>
          <Link href="/linee" onClick={closeMenu}>
            {t('lines')}
          </Link>
          <Link href="/mission" onClick={closeMenu}>
            {t('mission')}
          </Link>
          <Link href="/contatti" onClick={closeMenu}>
            {t('contacts')}
          </Link>
        </nav>
      </div>
    </div>
  );
}
