import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import MarketingEmail from '@/lib/db/models/MarketingEmail';

/**
 * GET /api/mailchimp/stats
 * Returns statistics about marketing emails in database
 * Used for admin dashboard before export
 */
export const GET = handleApi(async (req: NextRequest) => {
  // Check authorization
  const authHeader = req.headers.get('authorization');
  const apiSecret = process.env.API_SECRET_KEY;

  if (!apiSecret || !authHeader || authHeader !== `Bearer ${apiSecret}`) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDB();

    // Get total count
    const totalCount = await MarketingEmail.countDocuments();

    // Get recent emails (last 10)
    const recentEmails = await MarketingEmail.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email source createdAt')
      .lean();

    // Get count by source
    const sourceStats = await MarketingEmail.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      totalCount,
      recentEmails: recentEmails.map((e) => ({
        email: e.email,
        source: e.source,
        createdAt: e.createdAt,
      })),
      bySource: sourceStats.map((s) => ({
        source: s._id || 'unknown',
        count: s.count,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 });
  }
});
