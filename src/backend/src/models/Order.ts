import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface OrderAttributes {
  id: number;
  userId: number;
  total: number | string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderCreation = Optional<OrderAttributes, 'id' | 'status'>;

export class Order extends Model<OrderAttributes, OrderCreation> implements OrderAttributes {
  declare id: number;
  declare userId: number;
  declare total: number | string;
  declare status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function init(sequelize: Sequelize): typeof Order {
  Order.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: {
        type: DataTypes.ENUM('pending', 'paid', 'shipped', 'cancelled'),
        defaultValue: 'pending',
      },
    },
    { sequelize, tableName: 'orders', modelName: 'Order' }
  );
  return Order;
}
