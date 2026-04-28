import { createApp } from '../src/app';
import { sequelize, User, Product } from '../src/models';

export async function setupDb(): Promise<void> {
  await sequelize.sync({ force: true });
}

export async function teardownDb(): Promise<void> {
  // No-op: keep the shared in-memory sqlite connection open across test files.
  // Jest is invoked with --forceExit to cleanly terminate at the end.
}

export async function createUser(opts: {
  email?: string;
  password?: string;
  name?: string;
  role?: 'user' | 'admin';
} = {}) {
  const {
    email = 'user@test.com',
    password = 'password1',
    name = 'User',
    role = 'user',
  } = opts;
  return User.create({ email, password, name, role });
}

export async function createProduct(overrides: Record<string, unknown> = {}) {
  return Product.create({
    name: 'Test Product',
    description: 'desc',
    price: 9.99,
    stock: 5,
    category: 'misc',
    ...overrides,
  } as any);
}

export function app() {
  return createApp();
}
