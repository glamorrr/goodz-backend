'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Header extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Catalog }) {
      // define association here
      this.belongsTo(Catalog, { foreignKey: 'catalogId', onDelete: 'cascade' });
    }
  }
  Header.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(25),
        allowNull: false,
        validate: {
          notNull: { msg: 'title must be 3 to 25 characters' },
          len: {
            args: [3, 25],
            msg: 'title must be 3 to 25 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('title must be 3 to 25 characters');
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
        beforeValidate(header, options) {
          if (typeof header.title === 'string') {
            header.title = header.title.trim();
          }
        },
      },
      sequelize,
      modelName: 'Header',
      tableName: 'header',
    }
  );
  return Header;
};
