import type { Request, Response, NextFunction } from 'express';

interface SequelizeValidationItem {
  path?: string;
  message?: string;
}

interface AppError extends Error {
  status?: number;
  errors?: SequelizeValidationItem[];
}

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error(err);
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }
  const status = err.status || 500;
  return res.status(status).json({ error: err.message || 'Internal server error' });
}
