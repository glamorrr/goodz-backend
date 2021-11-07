const rateLimit = require('express-rate-limit');
const { handleFail } = require('./handleJSON');

const responseMessage = {
  message: 'Too many requests, please try again later',
};

const authLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  message: handleFail(null, responseMessage),
});

const uploadImageLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 100,
  message: handleFail(null, responseMessage),
});

const pageviewLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 30,
  message: handleFail(null, responseMessage),
});

module.exports = { authLimiter, uploadImageLimiter, pageviewLimiter };
