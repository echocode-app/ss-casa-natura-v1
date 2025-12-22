import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { log } from './logger';

export const adminAuth = (handler: Function) => {
  return async (req: NextRequest, context: any) => {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        log('error', 'No auth header');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.split(' ')[1];
      const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
      if (payload.role !== 'admin') {
        log('error', 'User is not admin', payload);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      context.user = payload;
      return handler(req, context);
    } catch (error: any) {
      log('error', 'Admin auth failed', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
};
