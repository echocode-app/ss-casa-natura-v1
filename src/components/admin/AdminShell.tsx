'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import AdminSidebar from './AdminSidebar';
import { canAccessAdminSection } from '@/lib/admin/access';
import notify from '@/lib/notify';

function getSectionFromPath(
  pathname: string,
):
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'hero-banners'
  | 'promotions'
  | 'submissions'
  | 'emails'
  | 'docs'
  | 'access' {
  if (pathname.startsWith('/admin/orders')) return 'orders';
  if (pathname.startsWith('/admin/products')) return 'products';
  if (pathname.startsWith('/admin/banners')) return 'hero-banners';
  if (pathname.startsWith('/admin/promotions')) return 'promotions';
  if (pathname.startsWith('/admin/submissions')) return 'submissions';
  if (pathname.startsWith('/admin/emails')) return 'emails';
  if (pathname.startsWith('/admin/docs')) return 'docs';
  if (pathname.startsWith('/admin/access')) return 'access';
  return 'dashboard';
}

const ALLOWED_ROLES = ['developer', 'superadmin', 'admin'];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const notifiedRef = useRef(false);
  const [accessDenied, setAccessDenied] = useState(false);

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
    const allowed = canAccessAdminSection(user.role, section, user.adminSections);

    if (!allowed) {
      if (!notifiedRef.current) {
        notify.error('Non hai accesso a questa sezione.');
        notifiedRef.current = true;
      }
      if (section !== 'dashboard') {
        router.replace('/admin');
      }
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user || (user.role && !ALLOWED_ROLES.includes(user.role))) {
    return <FullscreenSpinner />;
  }

  const section = getSectionFromPath(pathname || '/admin');
  if (!canAccessAdminSection(user.role, section, user.adminSections)) {
    if (accessDenied) {
      return (
        <div
          className="
            mx-auto
            w-full
            flex flex-row
            min-h-[calc(100vh-var(--header-h))]
            gap-2 lg:gap-6
          "
        >
          <AdminSidebar />
          <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 md:px-8 py-8 leading-relaxed">
            <div className="bg-white/80 backdrop-blur rounded-[24px] shadow-header border border-black/5 p-6">
              <h1 className="text-xl font-semibold">Accesso non disponibile</h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Non hai alcuna sezione assegnata. Contatta il superadmin per ottenere i permessi.
              </p>
            </div>
          </main>
        </div>
      );
    }
    return <FullscreenSpinner />;
  }

  return (
    <div
      className="
        mx-auto
        w-full
        flex flex-row
        min-h-[calc(100vh-var(--header-h))]
        gap-2 lg:gap-6
      "
      style={{ lineHeight: '1.6' }}
    >
      <AdminSidebar />
      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 md:px-8 py-8 leading-relaxed">
        {children}
      </main>
    </div>
  );
}
