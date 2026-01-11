'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { useTranslations } from 'next-intl';

export default function AccountSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations('user.account');

  const linkBaseClasses =
    'w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-between';

  const getNavClasses = (active: boolean) =>
    active
      ? `${linkBaseClasses} bg-[#fbfbe9] text-gray-900 border border-gray-200`
      : `${linkBaseClasses} text-gray-700 hover:bg-gray-50 hover:text-gray-900`;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <nav className="space-y-2">
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
        <hr className="my-4 border-gray-200" />
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t('actions.logout')}
        </button>
      </nav>
    </aside>
  );
}
