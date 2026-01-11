import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { getUser } from '@/lib/auth/getUser';

export const runtime = 'nodejs';

interface UserResponse {
  id: string;
  name?: string;
  nome?: string;
  surname?: string;
  cognome?: string;
  email: string;
  phone?: string;
  deliveryAddress?: string;
  role?: 'user' | 'admin';
  createdAt?: Date | string;
}

export const GET = handleApi(async (_req: NextRequest) => {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const dbUser = await User.findById(user.id).select(
    'name surname email phone deliveryAddress role createdAt',
  );

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const response: UserResponse = {
    id: dbUser._id.toString(),
    name: dbUser.name,
    nome: dbUser.name,
    surname: dbUser.surname,
    cognome: dbUser.surname,
    email: dbUser.email,
    phone: dbUser.phone,
    deliveryAddress: dbUser.deliveryAddress || (dbUser as any).address?.street || undefined,
    role: dbUser.role,
    createdAt: dbUser.createdAt,
  };

  return NextResponse.json(response);
});

export const PUT = handleApi(async (_req: NextRequest) => {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await _req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { nome, cognome, phone, deliveryAddress, email } = body;

  // at least one field should be provided
  if (!nome && !cognome && !phone && !deliveryAddress && !email) {
    return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
  }

  await connectToDB();

  const existing = await User.findById(user.id).select('email');
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (email && email !== existing.email) {
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
  }

  const updated = await User.findByIdAndUpdate(
    user.id,
    {
      ...(nome && { name: nome }),
      ...(cognome && { surname: cognome }),
      ...(phone && { phone }),
      ...(deliveryAddress !== undefined && { deliveryAddress }),
      ...(email && { email }),
      updatedAt: new Date(),
    },
    { new: true },
  ).select('name surname email phone deliveryAddress role createdAt');

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: updated._id,
    name: updated.name,
    nome: updated.name,
    surname: updated.surname,
    cognome: updated.surname,
    email: updated.email,
    phone: updated.phone,
    deliveryAddress: updated.deliveryAddress,
    role: updated.role,
    createdAt: updated.createdAt,
  });
});
