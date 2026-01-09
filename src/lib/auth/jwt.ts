import { SignJWT, jwtVerify } from 'jose';
import { JwtPayload } from './types';

function getSecret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not defined');
  return new TextEncoder().encode(s);
}

export const signToken = async (payload: JwtPayload): Promise<string> => {
  const secret = getSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload as JwtPayload;
};
