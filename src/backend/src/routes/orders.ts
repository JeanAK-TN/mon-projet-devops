import express from 'express';
import { body } from 'express-validator';
import * as ctrl from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from cart items (decrements product stock)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId: { type: integer }
 *                     quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation / stock error }
 */
router.post(
  '/',
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  ctrl.create
);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List current user's orders
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', ctrl.listMine);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get an order (owner or admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Forbidden }
 *       404: { description: Not found }
 */
router.get('/:id', ctrl.get);

export default router;
