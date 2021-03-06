'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Catalog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Store, Item, Header }) {
      // define association here
      this.belongsTo(Store, {
        foreignKey: 'storeId',
        onDelete: 'cascade',
        as: 'store',
      });
      this.hasOne(Item, { foreignKey: 'catalogId', as: 'item' });
      this.hasOne(Header, { foreignKey: 'catalogId', as: 'header' });
    }
  }
  Catalog.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          isInt: { msg: 'position must be an integer' },
          notNull: { msg: 'position must be an integer' },
          min: { args: 1, msg: 'oops! failed to change link position' },
          isNumber(value) {
            if (typeof value !== 'number') {
              throw new Error('position must be an integer');
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Catalog',
      tableName: 'catalog',
    }
  );
  return Catalog;
};
