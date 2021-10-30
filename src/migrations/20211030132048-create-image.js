'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('image', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'app_user',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      item_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'item',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'set null',
      },
      store_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'store',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'set null',
      },
      path: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      blurhash: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('image');
  },
};
