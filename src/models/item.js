'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Image, Catalog }) {
      // define association here
      this.hasOne(Image, { foreignKey: 'itemId', as: 'image' });
      this.belongsTo(Catalog, { foreignKey: 'catalogId' });
    }
  }
  Item.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: 'name must be 3 to 50 characters' },
          len: {
            args: [3, 50],
            msg: 'name must be 3 to 50 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('name must be 3 to 50 characters');
            }
          },
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'price must be an integer' },
          notNull: { msg: 'price must be an integer' },
          min: { args: [0], msg: "price can't be negative" },
          max: {
            args: 1 * 1000 * 1000 * 1000,
            msg: 'maximum price is 1 000 000 000',
          },
          isNumber(value) {
            if (typeof value !== 'number') {
              throw new Error('price must be an integer');
            }
          },
        },
      },
      isVisible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
          notNull: { msg: 'isVisible must be boolean' },
          isBoolean(value) {
            if (typeof value !== 'boolean') {
              throw new Error('isVisible must be boolean');
            }
          },
        },
      },
    },
    {
      hooks: {
        beforeValidate(catalog, options) {
          if (typeof catalog.name === 'string') {
            catalog.name = catalog.name.trim();
          }
        },
      },
      sequelize,
      modelName: 'Item',
      tableName: 'item',
    }
  );
  return Item;
};
