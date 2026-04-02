import * as jwt from 'jsonwebtoken';
import { UserEntity } from '../../src/modules/users/entities/user.entity';

export function generateAccessToken(user: UserEntity): string {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only';
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '1h' },
  );
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export function authCookie(token: string): string {
  return `accessToken=${token}`;
}
