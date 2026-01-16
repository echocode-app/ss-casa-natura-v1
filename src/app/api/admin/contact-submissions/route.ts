import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { requireDeveloperOrSuperadmin } from '@/lib/auth/requireAdmin';
import connectToDB from '@/lib/db/mongo';
import ContactSubmission from '@/lib/db/models/ContactSubmission';

export const GET = handleApi(async (req: Request) => {
  const authError = await requireDeveloperOrSuperadmin();
  if (authError) return authError;

  await connectToDB();

  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 50)));
  const skip = Math.max(0, Number(url.searchParams.get('skip') || 0));
  const q = (url.searchParams.get('q') || '').trim();
  const status = (url.searchParams.get('status') || '').trim();

  const query: any = {};
  if (status && ['new', 'resolved', 'rejected'].includes(status)) {
    query.status = status;
  }
  if (q) {
    query.$or = [
      { email: { $regex: q, $options: 'i' } },
      { name: { $regex: q, $options: 'i' } },
      { subject: { $regex: q, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    ContactSubmission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactSubmission.countDocuments(query),
  ]);

  const normalizedItems = items.map((it: any) => ({
    ...it,
    status: it.status || 'new',
  }));

  return NextResponse.json({ success: true, items: normalizedItems, total, limit, skip });
});
