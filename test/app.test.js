require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

const apiAuthSignup = require('./auth/signup/index.test');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

const appRequest = request(app);

apiAuthSignup(appRequest);
