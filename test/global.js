const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});
const { sequelize } = require('../src/models');
const appRequest = require('./appRequest');

module.exports = async () => {
  await sequelize.sync({ force: true });
  await appRequest.post('/auth/signup').send({
    email: 'mcdindonesia@gmail.com',
    password: 'mcdindonesia',
    name: 'McD Indonesia',
    url: 'mcdid',
  });

  await appRequest.post('/auth/signup').send({
    email: 'kfcindonesia@gmail.com',
    password: 'kfcindonesia',
    name: 'KFC Indonesia',
    url: 'kfcenak',
  });
};
