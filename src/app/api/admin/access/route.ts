import { NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import { requireDeveloperOrSuperadmin } from '@/lib/auth/requireAdmin';
import { getUser } from '@/lib/auth/getUser';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { ADMIN_ASSIGNABLE_SECTIONS } from '@/lib/admin/access';

const sectionEnum = z.enum(ADMIN_ASSIGNABLE_SECTIONS);

const grantSchema = z
  .object({
    email: z.string().email(),
    sections: z.array(sectionEnum).min(1),
  })
  .strict();

const revokeSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

function normalizeSections(sections: string[]) {
  const allowed = new Set(ADMIN_ASSIGNABLE_SECTIONS);
  return sections.map((s) => String(s).trim()).filter((s) => allowed.has(s as any));
}

async function requireSuperadmin() {
  const authUser = await getUser();
  if (!authUser) return null;
  await connectToDB();
  const dbUser = await User.findById(authUser.id).select('role');
  if (!dbUser) return null;
  return dbUser.role === 'superadmin' ? dbUser : null;
}

export const GET = handleApi(async () => {
  const authError = await requireDeveloperOrSuperadmin();
  if (authError) return authError;

  await connectToDB();

  const admins = await User.find({ role: 'admin' })
    .select('name surname email role adminSections')
    .sort({ email: 1 })
    .lean();

  return NextResponse.json({
    success: true,
    admins: admins.map((admin: any) => ({
      id: admin._id?.toString(),
      name: admin.name,
      surname: admin.surname,
      email: admin.email,
      role: admin.role,
      adminSections: normalizeSections(admin.adminSections || []),
    })),
    maxAdmins: 3,
    availableSections: ADMIN_ASSIGNABLE_SECTIONS,
  });
});

export const PUT = handleApi(async (req: Request) => {
  const authError = await requireDeveloperOrSuperadmin();
  if (authError) return authError;

  const superadmin = await requireSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { success: false, error: 'Solo il superadmin può gestire gli accessi.' },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = grantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validazione fallita',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  await connectToDB();

  const email = parsed.data.email.toLowerCase().trim();
  const sections = normalizeSections(parsed.data.sections);

  if (sections.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Seleziona almeno una sezione.' },
      { status: 400 },
    );
  }

  const target = await User.findOne({ email }).select('role email adminSections');
  if (!target) {
    return NextResponse.json(
      { success: false, error: 'Utente non registrato con questa email.' },
      { status: 404 },
    );
  }

  if (target.role === 'developer' || target.role === 'superadmin') {
    return NextResponse.json(
      { success: false, error: 'Non è possibile modificare questo ruolo.' },
      { status: 403 },
    );
  }

  const adminsCount = await User.countDocuments({
    role: 'admin',
    _id: { $ne: target._id },
  });

  if (target.role !== 'admin' && adminsCount >= 3) {
    return NextResponse.json(
      { success: false, error: 'Limite massimo di 3 admin raggiunto.' },
      { status: 409 },
    );
  }

  target.role = 'admin';
  target.adminSections = sections;
  target.updatedAt = new Date();
  await target.save();

  return NextResponse.json({
    success: true,
    admin: {
      id: target._id?.toString(),
      email: target.email,
      role: target.role,
      adminSections: sections,
    },
  });
});

export const DELETE = handleApi(async (req: Request) => {
  const authError = await requireDeveloperOrSuperadmin();
  if (authError) return authError;

  const superadmin = await requireSuperadmin();
  if (!superadmin) {
    return NextResponse.json(
      { success: false, error: 'Solo il superadmin può gestire gli accessi.' },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = revokeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validazione fallita',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  await connectToDB();

  const email = parsed.data.email.toLowerCase().trim();
  const target = await User.findOne({ email }).select('role email');

  if (!target) {
    return NextResponse.json(
      { success: false, error: 'Utente non registrato con questa email.' },
      { status: 404 },
    );
  }

  if (target.role === 'developer' || target.role === 'superadmin') {
    return NextResponse.json(
      { success: false, error: 'Non è possibile modificare questo ruolo.' },
      { status: 403 },
    );
  }

  target.role = 'user';
  target.adminSections = [];
  target.updatedAt = new Date();
  await target.save();

  return NextResponse.json({ success: true });
});
