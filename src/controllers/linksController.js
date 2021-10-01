const {
  Store,
  Link,
  sequelize,
  Sequelize: { Op },
} = require('../models');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.links_post = async (req, res) => {
  const userId = req.user.id;
  const { title, href } = req.body;
  try {
    const store = await Store.findOne({ where: { userId } });
    const totalLink = await store.countLinks();
    const newLink = await store.createLink({
      title,
      href,
      position: totalLink + 1,
    });

    return res
      .status(201)
      .json(handleSuccess({ ...newLink.toJSON(), storeId: undefined }));
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

module.exports.links_position_put = async (req, res) => {
  const userId = req.user.id;
  const linkId = req.params.id;
  const { position } = req.body;
  try {
    const store = await Store.findOne({ where: { userId } });
    const isPositionValid = await store.isLinkPositionValid(position);
    if (!isPositionValid) {
      return res
        .status(400)
        .json(
          handleFail(null, { message: 'oops! failed to change link position' })
        );
    }

    const selectedLink = await Link.findOne({
      where: { id: linkId, storeId: store.id },
    });

    await sequelize.transaction(async (t) => {
      await Link.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            position: { [Op.gt]: selectedLink.position },
            storeId: store.id,
          },
          transaction: t,
        }
      );
      await Link.update(
        { position: sequelize.literal('position + 1') },
        {
          where: {
            position: { [Op.gte]: position },
            storeId: store.id,
          },
          transaction: t,
        }
      );
      selectedLink.position = position;
      await selectedLink.save({ transaction: t });
    });

    res.status(200).json(handleSuccess());
  } catch (err) {
    if (err?.errors?.length) {
      const data = {
        [err.errors[0].path]: err.errors[0].message,
      };

      return res.status(400).json(handleFail(err, data));
    }

    res.status(500).json(handleError(err));
  }
};
