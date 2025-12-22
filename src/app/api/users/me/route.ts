import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

const handler = handleApi(async (req: NextRequest) => {
  await connectToDB();

  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await User.findById(payload.id).select('-passwordHash').lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (req.method === 'GET') {
    // Fetch profile
    return NextResponse.json(user);
  }

  if (req.method === 'PUT') {
    // Update profile fields
    const { name, surname, phone, address, email } = await req.json();

    const updated = await User.findByIdAndUpdate(
      payload.id,
      { name, surname, phone, address, email, updatedAt: new Date() },
      { new: true },
    ).select('-passwordHash');

    log('success', `User profile updated: ${user.email}`);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
});

export const GET = handler;
export const PUT = handler;
