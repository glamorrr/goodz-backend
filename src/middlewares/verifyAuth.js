const { handleFail } = require('../utils/handleJSON');
const { verifyToken } = require('../utils/jwt');

module.exports = (req, res, next) => {
  try {
    const authToken = req.cookies.token;
    const payload = verifyToken(authToken);
    req.user = payload;
    next();
  } catch (err) {
    return res
      .status(401)
      .json(handleFail(null, { message: 'unauthenticated' }));
  }
};
