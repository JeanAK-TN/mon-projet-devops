import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../types';

const SECRET = (): string => process.env.JWT_SECRET || 'dev-secret-change-me';

export function signToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, SECRET(), options);
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET()) as JwtPayload;
    next();
  } catch (_err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(role: 'user' | 'admin') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}
