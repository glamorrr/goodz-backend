const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`),
});
const debug = require('debug')('http');
const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    debug(`server running on port ${PORT}...`);
    await sequelize.sync({ alter: true });
    debug(`database connected!`);
  } catch (err) {
    console.error(err);
  }
});
