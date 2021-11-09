const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});
const { sequelize } = require('../src/models');
const { setS3BucketPolicy } = require('../src/utils/s3');

module.exports = async () => {
  try {
    await setS3BucketPolicy();
    await sequelize.authenticate();
  } catch (err) {
    console.error(err);
  }
};
