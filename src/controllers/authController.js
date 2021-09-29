const { User, Store, sequelize } = require('../models');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.signup_post = async (req, res) => {
  try {
    const { email, password, name, url } = req.body;
    await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        { email, password },
        { transaction: t }
      );
      await Store.create({ name, url, userId: newUser.id }, { transaction: t });
    });

    return res.status(201).json(handleSuccess());
  } catch (err) {
    if (err?.errors?.length) {
      const data = {};
      err.errors.forEach(({ path, type, origin, message }) => {
        const isEmailUsed =
          type === 'unique violation' && path === 'email' && origin === 'DB';
        if (isEmailUsed) message = 'email has already been taken';

        const isURLUsed =
          type === 'unique violation' && path === 'url' && origin === 'DB';
        if (isURLUsed) message = 'url has already been taken';

        data[path] = message;
      });

      return res.status(400).json(handleFail(err, data));
    }

    return res.status(500).json(handleError(err));
  }
};
