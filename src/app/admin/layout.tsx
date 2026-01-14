'use client';

import Link from 'next/link';
import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from '@/components/ui/Spinner/Spinner';

// 📌 Roles with admin panel access
const ALLOWED_ROLES = ['developer', 'superadmin', 'admin'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Якщо завантаження завершилось
    if (!isLoading) {
      // Якщо користувач не залогінений - на логін
      if (!user) {
        router.push('/auth/login?redirect=/admin');
        return;
      }

      // Якщо залогінений, але немає прав - на головну
      if (user.role && !ALLOWED_ROLES.includes(user.role)) {
        router.push('/');
        return;
      }
    }
  }, [user, isLoading, router]);

  // 📌 Show spinner during loading or redirect
  if (isLoading || !user || (user.role && !ALLOWED_ROLES.includes(user.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spinner size="lg" colorScheme="light" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <Link href="/admin" className="text-2xl font-bold text-white hover:text-gray-200">
            Admin
          </Link>
          <p className="text-gray-400 text-sm mt-2">Casa Natura</p>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              📦 Prodotti
            </Link>
            <Link
              href="/admin/mailchimp"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ✉️ Esportazione Mailchimp
            </Link>
            <Link
              href="/admin/settings"
              className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              ⚙️ Impostazioni
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
            ← Torna al sito
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
