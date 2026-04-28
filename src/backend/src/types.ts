import type { Request } from 'express';

export interface JwtPayload {
  id: number;
  email?: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
