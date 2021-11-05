'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pageview extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Store }) {
      // define association here
      this.belongsTo(Store, {
        foreignKey: 'storeId',
        onDelete: 'cascade',
        as: 'store',
      });
    }
  }
  Pageview.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      isMobile: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: { msg: 'isMobile must be boolean' },
          isBoolean(value) {
            if (typeof value !== 'boolean') {
              throw new Error('isMobile must be boolean');
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Pageview',
      tableName: 'pageview',
      timestamps: true,
      updatedAt: false,
    }
  );
  return Pageview;
};
