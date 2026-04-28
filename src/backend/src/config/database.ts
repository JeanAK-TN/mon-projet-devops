import { Sequelize } from 'sequelize';

const dialect = process.env.DB_DIALECT || 'postgres';

let sequelize: Sequelize;

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || ':memory:',
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'ecommerce',
    process.env.DB_USER || 'ecommerce',
    process.env.DB_PASSWORD || 'ecommerce',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    }
  );
}

export default sequelize;
