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
    w-full text-center md:text-left
    p-4 md:p-20 lg:pl-40
    lg:pl-40
    font-semibold text-[clamp(14px,3vw,28px)]
    transition-colors
    focus:outline-none
    flex items-center justify-center md:justify-start
    md:transition-transform md:duration-300
`;

  const getNavClasses = (active: boolean) =>
    active ? `${linkBaseClasses} bg-brand-light` : `${linkBaseClasses} bg-transparent`;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="bg-background-sidebar w-full mx-auto md:mx-0 md:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px]">
      <div className="pointer-events-none shadow-sidebar-right" />
      <nav
        className="
          flex flex-row md:flex-col
          justify-center md:justify-start
          items-center
          overflow-x-auto
        "
      >
        <button
          onClick={() => router.push('/account/orders')}
          className={getNavClasses(pathname === '/account/orders')}
          aria-current={pathname === '/account/orders' ? 'page' : undefined}
        >
          {t('orders.all')}
        </button>

        <button
          onClick={() => router.push('/account')}
          className={getNavClasses(pathname === '/account')}
          aria-current={pathname === '/account' ? 'page' : undefined}
        >
          {t('title')}
        </button>

        <button
          onClick={handleLogout}
          aria-label={t('actions.logout')}
          className={`${linkBaseClasses} group`}
        >
          <Logout
            className="
              w-5 h-5
              md:w-6 md:h-6
              lg:w-[72px] lg:h-[72px]
              flex-shrink-0
              transition-transform duration-300
              group-hover:scale-110 group-focus-visible:scale-110
            "
          />
          <span
            className="
            hidden md:inline-block
              ml-6
              opacity-0
              md:group-hover:opacity-100
              md:group-focus-visible:opacity-100
              transition-opacity duration-300
            "
          >
            {t('actions.logout')}
          </span>
        </button>
      </nav>
    </aside>
  );
}
