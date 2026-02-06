export type AdminRole = 'developer' | 'superadmin' | 'admin';

export type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'hero-banners'
  | 'promotions'
  | 'shipping'
  | 'submissions'
  | 'emails'
  | 'docs'
  | 'access';

export const ADMIN_ASSIGNABLE_SECTIONS = [
  'dashboard',
  'orders',
  'products',
  'hero-banners',
  'promotions',
  'submissions',
  'emails',
] as const;

export const DEFAULT_ADMIN_SECTIONS: AdminSection[] = [
  'dashboard',
  'products',
  'hero-banners',
  'promotions',
];

export function canAccessAdminSection(
  role: string | undefined,
  section: AdminSection,
  adminSections?: string[] | null,
): boolean {
  if (!role) return false;

  if (role === 'developer' || role === 'superadmin') return true;

  // Admins are limited to assigned sections (fallback to defaults).
  if (role === 'admin') {
    if (section === 'shipping') return false;
    if (section === 'access') return false;
    if (section === 'docs') return false;
    if (!Array.isArray(adminSections)) return false;
    return adminSections.includes(section);
  }

  return false;
}
