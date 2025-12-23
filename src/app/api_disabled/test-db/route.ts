import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';

export async function GET(_: NextRequest) {
  try {
    await connectToDB();
    return NextResponse.json({ success: true, message: 'Connected to DB!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message });
  }
}

// http://localhost:3000/api/test-db
