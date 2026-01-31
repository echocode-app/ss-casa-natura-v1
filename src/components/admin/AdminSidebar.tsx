'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthContext';
import { canAccessAdminSection } from '@/lib/admin/access';

type Item = {
  key:
    | 'dashboard'
    | 'orders'
    | 'products'
    | 'hero-banners'
    | 'promotions'
    | 'submissions'
    | 'emails'
    | 'docs'
    | 'access';
  label: string;
  href: string;
};

const items: Item[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'orders', label: 'Ordini', href: '/admin/orders' },
  { key: 'products', label: 'Prodotti', href: '/admin/products' },
  { key: 'hero-banners', label: 'Banner Hero', href: '/admin/banners' },
  { key: 'promotions', label: 'Promozioni', href: '/admin/promotions' },
  { key: 'submissions', label: 'Richieste contatto', href: '/admin/submissions' },
  { key: 'emails', label: 'Email', href: '/admin/emails' },
  { key: 'docs', label: 'Documentazione', href: '/admin/docs' },
  { key: 'access', label: 'Gestione accessi', href: '/admin/access' },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role;
  const adminSections = user?.adminSections;

  const linkBaseClasses = `
    w-full text-center md:text-left
    p-4 md:py-8 md:pr-6 md:pl-12
    lg:p-12 xl:pl-20
    font-semibold text-[clamp(14px,3vw,24px)]
    transition-colors
    focus:outline-none
    flex items-center justify-center md:justify-start
    md:transition-transform md:duration-300
  `;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);

  const getNavClasses = (active: boolean) =>
    active ? `${linkBaseClasses} bg-brand-light` : `${linkBaseClasses} bg-transparent`;

  const visible = items.filter((i) => canAccessAdminSection(role, i.key, adminSections));

  return (
    <aside className="bg-background-sidebar w-[240px] lg:w-[320px] xl:w-[380px] shrink-0">
      <div className="pointer-events-none shadow-sidebar-right" />

      <div className="px-4 pt-4 md:pt-8 md:px-8">
        <div className="rounded-[24px] bg-white/70 backdrop-blur px-4 py-3">
          <div className="font-semibold text-lg">Admin</div>
          <div className="text-sm text-gray-600">Casa Natura</div>
        </div>
      </div>

      <nav className="mt-3 flex flex-row md:flex-col justify-center md:justify-start items-center overflow-x-auto">
        {visible.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={getNavClasses(isActive(item.href))}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
