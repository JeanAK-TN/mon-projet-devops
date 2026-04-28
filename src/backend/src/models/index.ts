import sequelize from '../config/database';
import initUser, { User } from './User';
import initProduct, { Product } from './Product';
import initOrder, { Order } from './Order';
import initOrderItem, { OrderItem } from './OrderItem';

initUser(sequelize);
initProduct(sequelize);
initOrder(sequelize);
initOrderItem(sequelize);

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export { sequelize, User, Product, Order, OrderItem };
