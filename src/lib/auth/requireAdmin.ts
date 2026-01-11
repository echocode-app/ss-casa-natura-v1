import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/getUser';

export async function requireAdmin() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowedRoles = ['developer', 'superadmin', 'admin'];
  if (!user.role || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  return null;
}

export async function requireDeveloperOrSuperadmin() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.role || !['developer', 'superadmin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden: Developer or Superadmin access required' },
      { status: 403 },
    );
  }

  return null;
}
