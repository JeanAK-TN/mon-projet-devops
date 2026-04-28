import express from 'express';
import { body } from 'express-validator';
import * as ctrl from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('name').isString().notEmpty(),
  ctrl.register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK }
 *       401: { description: Invalid credentials }
 */
router.post(
  '/login',
  body('email').isEmail(),
  body('password').isString().notEmpty(),
  ctrl.login
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current user profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get('/me', authenticate, ctrl.me);

export default router;
