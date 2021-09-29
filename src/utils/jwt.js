const jwt = require('jsonwebtoken');

const JWT_MAX_AGE = 1 * 60 * 60; // 1 hour

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: JWT_MAX_AGE,
  });
};

module.exports = {
  createToken,
  JWT_MAX_AGE,
};
