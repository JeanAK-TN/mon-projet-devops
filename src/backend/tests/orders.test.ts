import request from 'supertest';
import { app, setupDb, teardownDb, createUser, createProduct } from './helpers';
import { signToken } from '../src/middleware/auth';
import { Product } from '../src/models';

describe('Orders API', () => {
  let server: ReturnType<typeof app>;
  let userToken: string;
  let otherToken: string;
  let adminToken: string;
  let userId: number;
  let product: Awaited<ReturnType<typeof createProduct>>;

  beforeAll(async () => {
    await setupDb();
    server = app();
    const user = await createUser({ email: 'buyer@o.com' });
    const other = await createUser({ email: 'other@o.com' });
    const admin = await createUser({ email: 'admin@o.com', role: 'admin' });
    userId = user.id;
    userToken = signToken({ id: user.id, role: 'user' });
    otherToken = signToken({ id: other.id, role: 'user' });
    adminToken = signToken({ id: admin.id, role: 'admin' });
    product = await createProduct({ name: 'Widget', price: 10, stock: 5 });
  });
  afterAll(async () => { await teardownDb(); });

  it('rejects unauthenticated', async () => {
    const res = await request(server).post('/api/orders').send({ items: [] });
    expect(res.status).toBe(401);
  });

  it('rejects empty items', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  it('creates an order, decrements stock, computes total', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product.id, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(parseFloat(res.body.total)).toBeCloseTo(20.0, 2);
    expect(res.body.items).toHaveLength(1);

    const refreshed = await Product.findByPk(product.id);
    expect(refreshed!.stock).toBe(3);
  });

  it('rejects insufficient stock', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product.id, quantity: 999 }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/stock/i);
  });

  it('rejects unknown product', async () => {
    const res = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: 99999, quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it('lists current user orders only', async () => {
    const res = await request(server)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((o: any) => o.userId === userId)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/orders/:id allows owner', async () => {
    const create = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });
    const id = create.body.id;
    const res = await request(server)
      .get(`/api/orders/${id}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('GET /api/orders/:id forbids non-owner', async () => {
    const create = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });
    const id = create.body.id;
    const res = await request(server)
      .get(`/api/orders/${id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(403);
  });

  it('GET /api/orders/:id allows admin', async () => {
    const create = await request(server)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });
    const id = create.body.id;
    const res = await request(server)
      .get(`/api/orders/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 404 for missing order', async () => {
    const res = await request(server)
      .get('/api/orders/99999')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });
});
