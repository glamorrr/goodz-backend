'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Item, Store }) {
      // define association here
      this.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });
      this.hasOne(Item, { foreignKey: 'imageId', onDelete: 'set null' });
      this.hasOne(Store, { foreignKey: 'imageId', onDelete: 'set null' });
      this.hasOne(Store, { foreignKey: 'backgroundId', onDelete: 'set null' });
    }
  }
  Image.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      path: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      blurhash: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Image',
      tableName: 'image',
    }
  );
  return Image;
};
