import type { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator';
import { Product } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      products: rows,
      pagination: { total: count, page, pages: Math.ceil(count / limit), limit },
    });
  } catch (err) {
    return next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (err) {
    return next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation error', details: errors.array() });
  }
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (err) {
    return next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.update(req.body);
    return res.json(product);
  } catch (err) {
    return next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
