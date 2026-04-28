import request from 'supertest';
import { app, setupDb, teardownDb, createUser, createProduct } from './helpers';
import { signToken } from '../src/middleware/auth';

describe('Products API', () => {
  let server: ReturnType<typeof app>;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await setupDb();
    server = app();
    const admin = await createUser({ email: 'admin@p.com', role: 'admin' });
    const user = await createUser({ email: 'user@p.com', role: 'user' });
    adminToken = signToken({ id: admin.id, email: admin.email, role: 'admin' });
    userToken = signToken({ id: user.id, email: user.email, role: 'user' });
  });
  afterAll(async () => {
    await teardownDb();
  });

  describe('GET /api/products', () => {
    beforeAll(async () => {
      await createProduct({ name: 'Alpha', category: 'a' });
      await createProduct({ name: 'Beta', category: 'b' });
      await createProduct({ name: 'Gamma alpha', category: 'a' });
    });

    it('returns paginated list', async () => {
      const res = await request(server).get('/api/products?page=1&limit=2');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(2);
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(3);
      expect(res.body.pagination.page).toBe(1);
    });

    it('filters by category', async () => {
      const res = await request(server).get('/api/products?category=b');
      expect(res.status).toBe(200);
      expect(res.body.products.every((p: any) => p.category === 'b')).toBe(true);
    });

    it('searches by name', async () => {
      const res = await request(server).get('/api/products?search=alpha');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a product', async () => {
      const p = await createProduct({ name: 'Solo' });
      const res = await request(server).get(`/api/products/${p.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Solo');
    });

    it('404 when missing', async () => {
      const res = await request(server).get('/api/products/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products (admin only)', () => {
    const payload = { name: 'Created', price: 9.99, category: 'misc', stock: 10 };

    it('rejects unauthenticated', async () => {
      const res = await request(server).post('/api/products').send(payload);
      expect(res.status).toBe(401);
    });

    it('rejects non-admin', async () => {
      const res = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);
      expect(res.status).toBe(403);
    });

    it('creates as admin', async () => {
      const res = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Created');
    });

    it('validates payload', async () => {
      const res = await request(server)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '', price: -1 });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('updates as admin', async () => {
      const p = await createProduct({ name: 'Old' });
      const res = await request(server)
        .put(`/api/products/${p.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New');
    });

    it('404 when missing', async () => {
      const res = await request(server)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('deletes as admin', async () => {
      const p = await createProduct({ name: 'Doomed' });
      const res = await request(server)
        .delete(`/api/products/${p.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(204);
    });

    it('404 when missing', async () => {
      const res = await request(server)
        .delete('/api/products/99999')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });
  });
});
