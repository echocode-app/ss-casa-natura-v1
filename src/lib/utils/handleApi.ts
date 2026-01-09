import { NextRequest, NextResponse } from 'next/server';

export const handleApi = (handler: (req: NextRequest, context?: any) => Promise<NextResponse>) => {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
};
