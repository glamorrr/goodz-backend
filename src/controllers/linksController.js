const { Store } = require('../models');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.links_post = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, href } = req.body;
    const store = await Store.findOne({ where: { userId } });
    const newLink = await store.createLink({ title, href });

    return res.status(201).json(handleSuccess(newLink));
  } catch (err) {
    if (err?.errors?.length) {
      const data = {};
      err.errors.forEach(({ path, message }) => {
        data[path] = message;
      });

      return res.status(400).json(handleFail(err, data));
    }

    return res.status(500).json(handleError(err));
  }
};
