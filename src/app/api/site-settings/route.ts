import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import SiteSettings from '@/lib/db/models/SiteSettings';

export const GET = handleApi(async () => {
  await connectToDB();

  const doc =
    (await SiteSettings.findOne({ key: 'default' }).lean()) ||
    (await SiteSettings.create({ key: 'default' }));

  return NextResponse.json({
    success: true,
    settings: {
      promoBar: doc.promoBar,
      globalPromotion: doc.globalPromotion,
      promoSubscription: doc.promoSubscription,
    },
  });
});
