import 'dotenv/config';
import { sequelize, User, Product } from '../models';

const products = [
  { name: 'Laptop Pro 15', description: '15-inch laptop, 16GB RAM', price: 1499.99, stock: 12, category: 'electronics', imageUrl: 'https://picsum.photos/seed/laptop/400' },
  { name: 'Wireless Headphones', description: 'Noise-cancelling', price: 199.0, stock: 50, category: 'electronics', imageUrl: 'https://picsum.photos/seed/headphones/400' },
  { name: 'Coffee Mug', description: 'Ceramic 350ml', price: 12.5, stock: 200, category: 'home', imageUrl: 'https://picsum.photos/seed/mug/400' },
  { name: 'Running Shoes', description: 'Lightweight', price: 89.9, stock: 30, category: 'sports', imageUrl: 'https://picsum.photos/seed/shoes/400' },
];

(async (): Promise<void> => {
  try {
    await sequelize.sync();

    const existing = await User.count();
    if (existing > 0) {
      console.log('Seed skipped (data already present)');
      process.exit(0);
    }

    await User.create({
      email: 'admin@example.com',
      password: 'admin1234',
      name: 'Admin',
      role: 'admin',
    });
    await User.create({
      email: 'user@example.com',
      password: 'user1234',
      name: 'Demo User',
      role: 'user',
    });

    await Product.bulkCreate(products as any);
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
