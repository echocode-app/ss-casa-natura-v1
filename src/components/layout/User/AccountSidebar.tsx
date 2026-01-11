'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { useTranslations } from 'next-intl';
import { Logout } from '@/components/ui/Buttons';

export default function AccountSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations('user.account');

  const linkBaseClasses = `
    group w-full text-right
    p-4 md:p-10 lg:pl-16 lg:pr-24 lg:pt-20 lg:pb-16
    text-h-accent text-[clamp(18px,3vw,28px)]
    transition-colors
    focus:outline-none
    flex items-center justify-center
    md:transition-transform md:duration-300 md:will-change-transform
    md:group-hover:scale-105 md:group-focus-visible:scale-105
    `;

  const getNavClasses = (active: boolean) =>
    active ? `${linkBaseClasses} bg-brand-light` : `${linkBaseClasses} bg-transparent`;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="bg-background-sidebar shadow-sidebar-right w-full max-w-[200px] md:max-w-[300px] xl:max-w-[400px]">
      <nav className="flex flex-col justify-center items-center text-center">
        <button
          onClick={() => router.push('/account')}
          className={getNavClasses(pathname === '/account')}
          aria-current={pathname === '/account' ? 'page' : undefined}
        >
          {t('title')}
        </button>

        <button
          onClick={() => router.push('/account/orders')}
          className={getNavClasses(pathname === '/account/orders')}
          aria-current={pathname === '/account/orders' ? 'page' : undefined}
        >
          {t('orders.all')}
        </button>

        <button
          onClick={handleLogout}
          className={`
            group w-full text-right
            p-10 lg:p-16
            text-h-accent text-[clamp(18px,3vw,28px)]
            transition-colors
            focus:outline-none
            flex items-center justify-center
            md:transition-transform md:duration-300 md:will-change-transform
            md:group-hover:scale-105 md:group-focus-visible:scale-105
          `}
        >
          <Logout
            className="
              w-6 h-6
              lg:w-[72px] lg:h-[72px]
              flex-shrink-0
            "
          />
        </button>
      </nav>
    </aside>
  );
}
