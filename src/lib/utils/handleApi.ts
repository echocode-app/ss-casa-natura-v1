import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/utils/logger';

export const handleApi = (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) => {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      logError('[api] unhandled error', error);
      const safeMessage = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message;
      return NextResponse.json({ error: safeMessage }, { status: 500 });
    }
  };
};
