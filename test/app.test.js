require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

const apiAuthSignup = require('./auth/signup/index.test');
const apiAuthLogin = require('./auth/login/index.test');
const apiLinks = require('./links/index.test');

beforeAll(async () => {
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
});

const appRequest = request(app);

apiAuthSignup(appRequest);
apiAuthLogin(appRequest);
apiLinks(appRequest);
