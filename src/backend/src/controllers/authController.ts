import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models';
import { signToken } from '../middleware/auth';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation error', details: errors.array() });
  }
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await User.create({ email, password, name });
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation error', details: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ user, token });
  } catch (err) {
    return next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};
