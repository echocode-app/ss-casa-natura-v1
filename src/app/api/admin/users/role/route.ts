import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { getUser } from '@/lib/auth/getUser';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateRoleSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin', 'superadmin', 'developer'], {
    message: 'Invalid role. Must be: user, admin, superadmin, or developer',
  }),
});

export const POST = handleApi(async (req: NextRequest) => {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const dbUser = await User.findById(currentUser.id);
  if (!dbUser || !['developer', 'superadmin'].includes(dbUser.role)) {
    return NextResponse.json(
      { error: 'Forbidden: Only developer or superadmin can assign roles' },
      { status: 403 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = updateRoleSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { email, role } = validation.data;

  const targetUser = await User.findOne({ email });
  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  targetUser.role = role;
  await targetUser.save();

  return NextResponse.json({
    message: `Role updated successfully`,
    user: {
      id: targetUser._id.toString(),
      email: targetUser.email,
      role: targetUser.role,
    },
  });
});

export const GET = handleApi(async () => {
  const currentUser = await getUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const dbUser = await User.findById(currentUser.id);
  if (!dbUser || !['developer', 'superadmin'].includes(dbUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await User.find({})
    .select('email name surname role createdAt')
    .sort({ createdAt: -1 });

  return NextResponse.json(users);
});
