import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/getUser';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { AdminSection } from '@/lib/admin/access';

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

export async function requireAdminRoles(allowedRoles: Array<'developer' | 'superadmin' | 'admin'>) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.role || !allowedRoles.includes(user.role as any)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

function forbiddenSection() {
  return NextResponse.json({ error: 'Forbidden: Section access required' }, { status: 403 });
}

export async function requireAdminSection(section: AdminSection) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.role) {
    return forbiddenSection();
  }

  if (user.role === 'developer' || user.role === 'superadmin') {
    return null;
  }

  if (section === 'access' || section === 'docs') {
    return forbiddenSection();
  }

  if (user.role !== 'admin') {
    return forbiddenSection();
  }

  await connectToDB();
  const dbUser = await User.findById(user.id).select('role adminSections').lean();
  if (!dbUser || dbUser.role !== 'admin') {
    return forbiddenSection();
  }

  const allowed = Array.isArray(dbUser.adminSections) ? dbUser.adminSections : [];
  if (!allowed.includes(section)) {
    return forbiddenSection();
  }

  return null;
}

export async function requireAdminAnySection(sections: AdminSection[]) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.role) {
    return forbiddenSection();
  }

  if (user.role === 'developer' || user.role === 'superadmin') {
    return null;
  }

  if (user.role !== 'admin') {
    return forbiddenSection();
  }

  await connectToDB();
  const dbUser = await User.findById(user.id).select('role adminSections').lean();
  if (!dbUser || dbUser.role !== 'admin') {
    return forbiddenSection();
  }

  const allowed = Array.isArray(dbUser.adminSections) ? dbUser.adminSections : [];
  const ok = sections.some((s) => allowed.includes(s));
  return ok ? null : forbiddenSection();
}
