'use strict';
const bcrypt = require('bcrypt');
const moment = require('moment');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Store, Image }) {
      // define association here
      this.hasOne(Store, { foreignKey: 'userId' });
      this.hasMany(Image, {
        foreignKey: 'userId',
        as: 'images',
        onDelete: 'cascade',
      });
    }

    async isPasswordValid(plainTextPassword) {
      return (
        typeof plainTextPassword === 'string' &&
        (await bcrypt.compare(plainTextPassword, this.hashedPassword))
      );
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'email must be a valid email address' },
          notNull: { msg: 'email must be a valid email address' },
          isLowercase: { msg: 'email must be a valid email address' },
          len: {
            args: [10, 50],
            msg: 'email must be 10 to 50 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('email must be a valid email address');
            }
          },
        },
      },
      hashedPassword: {
        type: DataTypes.STRING(100),
      },
      password: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          notNull: { msg: 'password must be 8 to 30 characters' },
          len: {
            args: [8, 30],
            msg: 'password must be 8 to 30 characters',
          },
          isString(value) {
            if (typeof value !== 'string') {
              throw new Error('password must be 8 to 30 characters');
            }
          },
        },
      },
    },
    {
      hooks: {
        beforeValidate: (user, options) => {
          if (typeof user.email === 'string') {
            user.email = user.email?.toLowerCase().trim();
          }
        },
        beforeCreate: async (user, options) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.hashedPassword = hashedPassword;
        },
      },
      sequelize,
      modelName: 'User',
      tableName: 'app_user',
    }
  );
  return User;
};
