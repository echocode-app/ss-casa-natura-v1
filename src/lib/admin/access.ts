export type AdminRole = 'developer' | 'superadmin' | 'admin';

export type AdminSection =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'hero-banners'
  | 'promotions'
  | 'submissions'
  | 'mailchimp'
  | 'settings';

export function canAccessAdminSection(role: string | undefined, section: AdminSection): boolean {
  if (!role) return false;

  if (role === 'developer' || role === 'superadmin') return true;

  // admin ограничен: продукты/баннеры/промо
  if (role === 'admin') {
    return ['dashboard', 'products', 'hero-banners', 'promotions', 'mailchimp'].includes(section);
  }

  return false;
}
