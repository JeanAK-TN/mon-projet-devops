require('dotenv').config();

const common = {
  username: process.env.DB_USER || 'ecommerce',
  password: process.env.DB_PASSWORD || 'ecommerce',
  database: process.env.DB_NAME || 'ecommerce',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: { ...common },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: { ...common },
};
