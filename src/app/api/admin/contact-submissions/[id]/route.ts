import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireDeveloperOrSuperadmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import ContactSubmission from '@/lib/db/models/ContactSubmission';

export const GET = handleApi(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const authError = await requireDeveloperOrSuperadmin();
    if (authError) return authError;

    await connectToDB();

    const { id } = await params;

    const item = await ContactSubmission.findById(id).lean();
    if (!item) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  },
);
