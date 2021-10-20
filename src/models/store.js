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
    static associate({ User, Link, Catalog }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });
      this.hasMany(Link, { foreignKey: 'storeId', as: 'links' });
      this.hasMany(Catalog, { foreignKey: 'storeId', as: 'catalog' });
    }

    async isLinkPositionValid(position) {
      const totalLinks = await this.countLinks();
      const isValid =
        Number.isInteger(position) && position >= 1 && position <= totalLinks;
      return isValid;
    }

    async isCatalogPositionValid(position) {
      const totalCatalog = await this.countCatalog();
      const isValid =
        Number.isInteger(position) && position >= 1 && position <= totalCatalog;
      return isValid;
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
        validate: {
          notNull: { msg: 'isCredit must be boolean' },
          isBoolean(value) {
            if (typeof value !== 'boolean') {
              throw new Error('isCredit must be boolean');
            }
          },
        },
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
