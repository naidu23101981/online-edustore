// src/modules/auth/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../config/env';

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}
