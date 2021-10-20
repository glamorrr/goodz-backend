const {
  Store,
  Sequelize: { ValidationError },
} = require('../models');
const { OtherError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.store_is_credit_put = async (req, res) => {
  const userId = req.user.id;
  const { isCredit } = req.body;

  try {
    const updatedStore = (
      await Store.update(
        { isCredit },
        {
          where: { userId },
          returning: ['is_credit'],
          plain: true,
        }
      )
    )[1];
    if (!updatedStore) throw new OtherError('isCredit not updated');

    res.status(200).json(handleSuccess(updatedStore));
  } catch (err) {
    if (err instanceof OtherError) {
      return res.status(400).json(handleFail(null, { message: err.message }));
    }

    if (err instanceof ValidationError) {
      const data = {};
      err.errors.forEach(({ path, message }) => {
        data[path] = message;
      });
      return res.status(400).json(handleFail(err, data));
    }

    res.status(500).json(handleError(err));
  }
};
