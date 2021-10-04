const {
  Store,
  Link,
  sequelize,
  Sequelize: { Op, ValidationError },
} = require('../models');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');
const {
  AuthorizeError,
  ResourceNotFoundError,
  OtherError,
} = require('../utils/error');

module.exports.links_post = async (req, res) => {
  const userId = req.user.id;
  const { title, href } = req.body;
  try {
    const store = await Store.findOne({ where: { userId }, include: 'links' });

    const totalLinks = store.links.length;
    const newLink = await store.createLink({
      title,
      href,
      position: totalLinks + 1,
    });

    return res
      .status(201)
      .json(handleSuccess({ ...newLink.toJSON(), storeId: undefined }));
  } catch (err) {
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

module.exports.links_put = async (req, res) => {
  const userId = req.user.id;
  const linkId = req.params.id;
  const { title, href, isVisible } = req.body;
  try {
    const selectedLink = await Link.findOne({
      where: { id: linkId },
      include: 'store',
    });

    if (!selectedLink) throw new ResourceNotFoundError('link not found');
    if (selectedLink.store.userId !== userId) throw new AuthorizeError();

    selectedLink.title = title;
    selectedLink.href = href;
    selectedLink.isVisible = isVisible;
    const updatedLink = await selectedLink.save();

    const result = {
      id: updatedLink.id,
      title: updatedLink.title,
      href: updatedLink.href,
      position: updatedLink.position,
      isVisible: updatedLink.isVisible,
    };

    return res.status(200).json(handleSuccess(result));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    if (err instanceof AuthorizeError) {
      return res.status(401).json(handleFail(null, { message: err.message }));
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

module.exports.links_position_put = async (req, res) => {
  const userId = req.user.id;
  const linkId = req.params.id;
  const { position } = req.body;
  try {
    const store = await Store.findOne({ where: { userId } });

    const isPositionValid = await store.isLinkPositionValid(position);
    if (!isPositionValid) {
      throw new OtherError('oops! failed to change link position');
    }

    const selectedLink = await Link.findOne({
      where: { id: linkId, storeId: store.id },
    });
    if (!selectedLink) throw new ResourceNotFoundError('link not found');

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
    if (err instanceof OtherError) {
      return res
        .status(400)
        .json(
          handleFail(null, { message: 'oops! failed to change link position' })
        );
    }

    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
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
