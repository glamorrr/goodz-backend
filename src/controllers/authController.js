const cookie = require('cookie');
const {
  User,
  Store,
  sequelize,
  Sequelize: { UniqueConstraintError, ValidationError },
} = require('../models');
const COOKIE_OPTIONS = require('../utils/COOKIE_OPTIONS');
const { ResourceNotFoundError, OtherError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');
const { createToken, JWT_MAX_AGE } = require('../utils/jwt');

module.exports.signup_post = async (req, res) => {
  const { email, password, name, url } = req.body;

  try {
    const result = await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        { email, password },
        { transaction: t }
      );
      const newStore = await Store.create(
        { name, url, userId: newUser.id },
        { transaction: t }
      );

      return {
        id: newStore.id,
        name: newStore.name,
        url: newStore.url,
        user: { email: newUser.email },
      };
    });

    return res.status(201).json(handleSuccess(result));
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const { path } = err.errors[0];
      let message;

      if (path === 'email') message = 'email has already been taken';
      if (path === 'url') message = 'url has already been taken';

      return res.status(400).json(handleFail(err, { [path]: message }));
    }

    if (err instanceof ValidationError) {
      const data = {};
      err.errors.forEach(({ path, message }) => {
        data[path] = message;
      });
      return res.status(400).json(handleFail(err, data));
    }

    return res.status(500).json(handleError(err));
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email: email?.toLowerCase() || '' },
    });

    if (!user) throw new ResourceNotFoundError('invalid email and password');

    const isAuthenticated = await user.isPasswordValid(password);
    if (!isAuthenticated) throw new OtherError('invalid email and password');

    user.lastLoggedIn = new Date();
    await user.save();

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', createToken({ id: user.id }), {
        ...COOKIE_OPTIONS,
        maxAge: JWT_MAX_AGE,
      })
    );
    res.status(200).json(handleSuccess());
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(401).json(handleFail(null, { message: err.message }));
    }

    if (err instanceof OtherError) {
      return res.status(401).json(handleFail(null, { message: err.message }));
    }

    const error = handleError(err);
    res.status(500).json(error);
  }
};

module.exports.logout_post = (req, res) => {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', '', { ...COOKIE_OPTIONS, maxAge: 1 })
  );
  res.status(200).json(handleSuccess());
};
