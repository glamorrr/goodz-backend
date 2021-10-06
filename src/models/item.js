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
      this.belongsTo(Image, { foreignKey: 'imageId', as: 'image' });
      this.hasOne(Catalog, { foreignKey: 'itemId' });
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
          is: {
            args: /^[ a-zA-Z0-9$@#.+-]+$/g,
            msg: 'name can only contain number, letter, @, #, $, +, -, and .',
          },
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
          max: { args: 100 * 1000 * 1000, msg: 'maximum price is 100000000' },
          isNumber(value) {
            if (typeof value !== 'number') {
              throw new Error('price must be an integer');
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

          const convertedPrice = Number(catalog.price);
          const isValidPrice =
            !Number.isNaN(convertedPrice) &&
            convertedPrice !== 0 &&
            Number.isInteger(convertedPrice);

          if (isValidPrice) {
            catalog.price = parseInt(catalog.price, 10);
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
