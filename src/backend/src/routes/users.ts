import express from 'express';
import * as ctrl from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';

const router = express.Router();

router.use(authenticate, requireRole('admin'));

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get('/', ctrl.list);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Not found }
 */
router.get('/:id', ctrl.get);

export default router;
