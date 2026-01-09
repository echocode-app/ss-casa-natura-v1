'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { useTranslations } from 'next-intl';

export default function AccountSidebar() {
  const router = useRouter();
  const { logout } = useAuth();
  const t = useTranslations('user.account');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className="w-64 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <nav className="space-y-2">
        <button
          onClick={() => router.push('/account')}
          className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-current="page"
        >
          {t('title')}
        </button>
        <button
          onClick={() => router.push('/account/orders')}
          className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {t('orders.title')}
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
