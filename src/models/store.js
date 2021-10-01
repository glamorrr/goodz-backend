'use strict';
const { Model } = require('sequelize');
const user = require('./user');
module.exports = (sequelize, DataTypes) => {
  class Store extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Link }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });
      this.hasMany(Link, { foreignKey: 'storeId' });
    }
  }
  Store.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      url: {
        type: DataTypes.STRING(25),
        allowNull: false,
        unique: true,
        validate: {
          isLowercase: { msg: 'url must be in lowercase' },
          isAlphanumeric: { msg: 'url can only contain number or letter' },
          notNull: { msg: 'url must be 3 to 25 characters' },
          len: {
            args: [3, 25],
            msg: 'url must be 3 to 25 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('url must be 3 to 25 characters');
            }
          },
        },
      },
      name: {
        type: DataTypes.STRING(25),
        allowNull: false,
        validate: {
          is: {
            args: /[a-zA-Z$@#.]/g,
            msg: 'name can only contain number, letter, @, #, $, and .',
          },
          notNull: { msg: 'name must be 3 to 25 characters' },
          len: {
            args: [3, 25],
            msg: 'name must be 3 to 25 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('name must be 3 to 25 characters');
            }
          },
        },
      },
      isCredit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isGofood: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      description: {
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
    },
    {
      hooks: {
        beforeValidate(store, options) {
          if (typeof store.url === 'string') {
            store.url = store.url.toLowerCase().trim();
          }

          if (typeof store.name === 'string') {
            store.name = store.name = store.name.trim();
          }
        },
      },
      sequelize,
      modelName: 'Store',
      tableName: 'store',
    }
  );
  return Store;
};
