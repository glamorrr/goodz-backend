'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Link extends Model {
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
  Link.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: 'name must be 3 to 50 characters' },
          len: {
            args: [3, 50],
            msg: 'title must be 3 to 50 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('title must be 3 to 50 characters');
            }
          },
        },
      },
      href: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'url must be a valid url' },
          isUrl: { msg: 'url must be a valid url' },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('url must be a valid url');
            }
          },
        },
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        beforeValidate: (link, options) => {
          if (typeof link.title === 'string') link.title = link.title.trim();
          if (typeof link.href === 'string') link.href = link.href.trim();
        },
      },
      sequelize,
      modelName: 'Link',
      tableName: 'link',
    }
  );
  return Link;
};
