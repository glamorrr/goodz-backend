require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const appRequest = require('./appRequest');

const apiAuthSignup = require('./auth/signup/index.test');
const apiAuthLogin = require('./auth/login/index.test');
const apiLinks = require('./links/index.test');

apiAuthSignup(appRequest);
apiAuthLogin(appRequest);
apiLinks(appRequest);
