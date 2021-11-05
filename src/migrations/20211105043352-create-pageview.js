'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pageview', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      store_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'store',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      is_mobile: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pageview');
  },
};
