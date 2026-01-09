import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { getUser } from '@/lib/auth/getUser';

export const GET = handleApi(async (req: NextRequest) => {
  const authUser = await getUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDB();

  const user = await User.findById(authUser.id).select(
    'name surname email phone address role createdAt',
  );

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user._id,
    nome: user.name,
    cognome: user.surname,
    email: user.email,
    phone: user.phone || '',
    address: user.address || {},
    createdAt: user.createdAt,
  });
});

export const PUT = handleApi(async (req: NextRequest) => {
  const authUser = await getUser();
  if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { nome, cognome, phone, address } = body;

  // at least one field should be provided
  if (!nome && !cognome && !phone && !address) {
    return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
  }

  await connectToDB();

  const updated = await User.findByIdAndUpdate(
    authUser.id,
    {
      ...(nome && { name: nome }),
      ...(cognome && { surname: cognome }),
      ...(phone && { phone }),
      ...(address && { address }),
      updatedAt: new Date(),
    },
    { new: true },
  ).select('name surname email phone address');

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: updated._id,
    nome: updated.name,
    cognome: updated.surname,
    email: updated.email,
    phone: updated.phone || '',
    address: updated.address || {},
  });
});
