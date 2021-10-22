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
const { ResourceNotFoundError, OtherError } = require('../utils/error');

module.exports.links_post = async (req, res) => {
  const userId = req.user.id;
  const { title, href } = req.body;
  try {
    const store = await Store.findOne({ where: { userId }, include: 'links' });

    if (!store) throw new ResourceNotFoundError('store not found');

    const newLink = await sequelize.transaction(async (t) => {
      await Link.update(
        { position: sequelize.literal('position + 1') },
        { where: { storeId: store.id }, transaction: t }
      );
      const newLink = await store.createLink(
        { title, href },
        { transaction: t }
      );

      return newLink;
    });

    const linkResult = newLink.toJSON();
    delete linkResult.storeId;

    return res.status(201).json(handleSuccess(linkResult));
  } catch (err) {
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
      include: {
        model: Store,
        as: 'store',
        where: { userId },
      },
    });

    if (!selectedLink) throw new ResourceNotFoundError('link not found');

    const updatedLink = (
      await Link.update(
        { title, href, isVisible },
        {
          where: { id: selectedLink.id },
          returning: ['id', 'title', 'href', 'is_visible'],
          plain: true,
        }
      )
    )[1];
    if (!updatedLink) throw new OtherError('link not updated');

    const result = updatedLink;

    return res.status(200).json(handleSuccess(result));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

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

    return res.status(500).json(handleError(err));
  }
};

module.exports.links_position_put = async (req, res) => {
  const userId = req.user.id;
  const linkId = req.params.id;
  const { position } = req.body;

  try {
    const store = await Store.findOne({ where: { userId } });
    if (!store) throw new ResourceNotFoundError('link not found');

    const selectedLink = await Link.findOne({
      where: { id: linkId, storeId: store.id },
    });
    if (!selectedLink) throw new ResourceNotFoundError('link not found');

    const isPositionValid = await store.isLinkPositionValid(position);
    if (!isPositionValid) {
      throw new OtherError('oops! failed to change link position');
    }

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
      const updatedLink = (
        await Link.update(
          { position },
          {
            where: { id: selectedLink.id, storeId: store.id },
            returning: true,
            plain: true,
            transaction: t,
          }
        )
      )[1];

      if (!updatedLink) throw new OtherError('link not updated');
    });

    res.status(200).json(handleSuccess());
  } catch (err) {
    if (err instanceof OtherError) {
      return res.status(400).json(handleFail(null, { message: err.message }));
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

module.exports.links_get = async (req, res) => {
  const userId = req.user.id;
  try {
    const links = await Link.findAll({
      attributes: { exclude: ['storeId'] },
      order: ['position'],
      include: {
        model: Store,
        as: 'store',
        where: { userId },
        attributes: [],
      },
    });

    return res.status(200).json(handleSuccess(links));
  } catch (err) {
    return res.status(500).json(handleError(err));
  }
};

module.exports.links_delete = async (req, res) => {
  const userId = req.user.id;
  const linkId = req.params.id;

  try {
    const selectedLink = await Link.findOne({
      where: { id: linkId },
      include: { model: Store, as: 'store', where: { userId }, attributes: [] },
    });
    if (!selectedLink) throw new ResourceNotFoundError('link not found');

    await sequelize.transaction(async (t) => {
      await Link.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            storeId: selectedLink.storeId,
            position: { [Op.gt]: selectedLink.position },
          },
          transaction: t,
        }
      );
      await selectedLink.destroy({ transaction: t });
    });

    const deletedLink = selectedLink.toJSON();
    delete deletedLink.storeId;

    return res.status(200).json(handleSuccess(deletedLink));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};
