import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { adminAuth } from '@/lib/utils/adminAuth';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

export const GET = handleApi(
  adminAuth(async () => {
    await connectToDB();
    const users = await User.find();
    log('success', `Fetched users: ${users.length}`);
    return NextResponse.json(users);
  }),
);
