import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { adminAuth } from '@/lib/utils/adminAuth';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

interface Params {
  id: string;
}

export const PUT = handleApi(
  adminAuth(async (req: NextRequest, { params }: { params: Params }) => {
    await connectToDB();
    const data = await req.json();
    const user = await User.findByIdAndUpdate(params.id, data, { new: true });
    log('success', `User updated: ${params.id}`);
    return NextResponse.json(user);
  }),
);

export const DELETE = handleApi(
  adminAuth(async (req: NextRequest, { params }: { params: Params }) => {
    await connectToDB();
    await User.findByIdAndDelete(params.id);
    log('success', `User deleted: ${params.id}`);
    return NextResponse.json({ success: true });
  }),
);
