const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});
const { sequelize } = require('../src/models');

module.exports = async () => {
  await sequelize.authenticate();
};
