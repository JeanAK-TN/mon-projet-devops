import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface ProductAttributes {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stock: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductCreation = Optional<ProductAttributes, 'id' | 'description' | 'imageUrl' | 'stock'>;

export class Product extends Model<ProductAttributes, ProductCreation> implements ProductAttributes {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare imageUrl: string | null;
  declare stock: number;
  declare category: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function init(sequelize: Sequelize): typeof Product {
  Product.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      imageUrl: { type: DataTypes.STRING },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
      category: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, tableName: 'products', modelName: 'Product' }
  );
  return Product;
}
