import jwt from 'jsonwebtoken';
import { JwtPayload } from './types';

function getSecret(): string {
  const s = process.env.JWT_SECRET as string | undefined;
  if (!s) throw new Error('JWT_SECRET is not defined');
  return s;
}

export const signToken = (payload: JwtPayload) => {
  const secret = getSecret();
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = getSecret();
  return jwt.verify(token, secret) as JwtPayload;
};
