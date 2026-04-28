import type { Request, Response, NextFunction } from 'express';
import { User } from '../models';

export const list = async (_req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};
