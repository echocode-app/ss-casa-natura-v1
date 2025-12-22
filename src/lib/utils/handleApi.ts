import { NextRequest, NextResponse } from 'next/server';
import { log } from './logger';

export const handleApi = (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) => {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      log('error', 'API Error', error);
      return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
    }
  };
};
