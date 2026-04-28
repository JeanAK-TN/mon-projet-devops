'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'shipped', 'cancelled'),
        defaultValue: 'pending',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('orders', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
    }
  },
};
