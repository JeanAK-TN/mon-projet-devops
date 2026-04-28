import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderItemCreation = Optional<OrderItemAttributes, 'id'>;

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreation>
  implements OrderItemAttributes
{
  declare id: number;
  declare orderId: number;
  declare productId: number;
  declare quantity: number;
  declare price: number | string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function init(sequelize: Sequelize): typeof OrderItem {
  OrderItem.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    },
    { sequelize, tableName: 'order_items', modelName: 'OrderItem' }
  );
  return OrderItem;
}
