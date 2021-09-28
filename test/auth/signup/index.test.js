const emailTest = require('./email.test');
const passwordTest = require('./password.test');
const nameTest = require('./name.test');
const urlTest = require('./url.test');

module.exports = (appRequest) => {
  describe('POST /auth/signup', () => {
    emailTest(appRequest);
    passwordTest(appRequest);
    nameTest(appRequest);
    urlTest(appRequest);
  });
};
