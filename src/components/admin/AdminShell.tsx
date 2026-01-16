'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import AdminSidebar from './AdminSidebar';
import { canAccessAdminSection } from '@/lib/admin/access';

function getSectionFromPath(
  pathname: string,
):
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'hero-banners'
  | 'promotions'
  | 'submissions'
  | 'mailchimp'
  | 'settings' {
  if (pathname.startsWith('/admin/orders')) return 'orders';
  if (pathname.startsWith('/admin/products')) return 'products';
  if (pathname.startsWith('/admin/banners')) return 'hero-banners';
  if (pathname.startsWith('/admin/promotions')) return 'promotions';
  if (pathname.startsWith('/admin/submissions')) return 'submissions';
  if (pathname.startsWith('/admin/mailchimp')) return 'mailchimp';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'dashboard';
}

const ALLOWED_ROLES = ['developer', 'superadmin', 'admin'];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/auth/login?redirect=/admin');
      return;
    }

    if (!user.role || !ALLOWED_ROLES.includes(user.role)) {
      router.replace('/');
      return;
    }

    const section = getSectionFromPath(pathname || '/admin');
    if (!canAccessAdminSection(user.role, section)) {
      router.replace('/admin');
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user || (user.role && !ALLOWED_ROLES.includes(user.role))) {
    return <FullscreenSpinner />;
  }

  const section = getSectionFromPath(pathname || '/admin');
  if (!canAccessAdminSection(user.role, section)) {
    return <FullscreenSpinner />;
  }

  return (
    <div
      className="
        mx-auto
        w-full
        flex flex-col md:flex-row
        min-h-[calc(100vh-var(--header-h))]
        gap-2 lg:gap-6
      "
    >
      <AdminSidebar />
      <main className="flex-1 mx-auto w-full md:max-w-[1100px] px-4 md:px-8 py-6">{children}</main>
    </div>
  );
}
