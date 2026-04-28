'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const adminHash = await bcrypt.hash('admin1234', 10);
    const userHash = await bcrypt.hash('user1234', 10);

    await queryInterface.bulkInsert('users', [
      { email: 'admin@example.com', password: adminHash, name: 'Admin', role: 'admin', createdAt: now, updatedAt: now },
      { email: 'user@example.com', password: userHash, name: 'Demo User', role: 'user', createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('products', [
      { name: 'Laptop Pro 15', description: '15-inch laptop, 16GB RAM', price: 1499.99, stock: 12, category: 'electronics', imageUrl: 'https://picsum.photos/seed/laptop/400', createdAt: now, updatedAt: now },
      { name: 'Wireless Headphones', description: 'Noise-cancelling', price: 199.0, stock: 50, category: 'electronics', imageUrl: 'https://picsum.photos/seed/headphones/400', createdAt: now, updatedAt: now },
      { name: 'Coffee Mug', description: 'Ceramic 350ml', price: 12.5, stock: 200, category: 'home', imageUrl: 'https://picsum.photos/seed/mug/400', createdAt: now, updatedAt: now },
      { name: 'Running Shoes', description: 'Lightweight', price: 89.9, stock: 30, category: 'sports', imageUrl: 'https://picsum.photos/seed/shoes/400', createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
