import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sequelize, Order, OrderItem, Product } from '../models';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation error', details: errors.array() });
  }

  const { items } = req.body as { items?: Array<{ productId: number; quantity: number }> };
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  const t = await sequelize.transaction();
  try {
    let total = 0;
    const itemsData: Array<{ productId: number; quantity: number; price: number }> = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      const qty = parseInt(String(item.quantity), 10);
      if (!Number.isFinite(qty) || qty < 1) {
        await t.rollback();
        return res.status(400).json({ error: `Invalid quantity for product ${product.id}` });
      }
      if (product.stock < qty) {
        await t.rollback();
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      const unit = parseFloat(String(product.price));
      total += unit * qty;
      itemsData.push({ productId: product.id, quantity: qty, price: unit });
      await product.update({ stock: product.stock - qty }, { transaction: t });
    }

    const order = await Order.create(
      { userId: req.user!.id, total: total.toFixed(2), status: 'pending' },
      { transaction: t }
    );
    await OrderItem.bulkCreate(
      itemsData.map((i) => ({ ...i, orderId: order.id })),
      { transaction: t }
    );

    await t.commit();

    const full = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });
    return res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    return next(err);
  }
};

export const listMine = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user!.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json(order);
  } catch (err) {
    return next(err);
  }
};
