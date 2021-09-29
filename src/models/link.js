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
      this.belongsTo(Store, { foreignKey: 'storeId', onDelete: 'cascade' });
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
        },
      },
      href: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: 'url must be a valid url' },
          isUrl: { msg: 'url must be a valid url' },
        },
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'position must be an integer' },
          notNull: { msg: 'position must be an integer' },
          min: { args: 1, msg: 'position must be positive' },
        },
      },
      isVisible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      hooks: {
        beforeValidate: async (link, options) => {
          const countLink = await Link.count({
            where: { storeId: link.storeId },
          });
          link.position = countLink + 1;
          link.title = link.title?.trim();
          link.href = link.href?.trim();
        },
      },
      sequelize,
      modelName: 'Link',
      tableName: 'link',
    }
  );
  return Link;
};
