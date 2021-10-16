const {
  Store,
  Item,
  Catalog,
  sequelize,
  Sequelize: { ValidationError },
} = require('../models');
const { ResourceNotFoundError, OtherError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.items_post = async (req, res) => {
  const userId = req.user.id;
  const { name, price } = req.body;
  try {
    const store = await Store.findOne({ where: { userId } });
    const result = await sequelize.transaction(async (t) => {
      await Catalog.update(
        { position: sequelize.literal('position + 1') },
        { where: { storeId: store.id }, transaction: t }
      );
      const newCatalog = await Catalog.create(
        { storeId: store.id },
        { transaction: t }
      );
      const newItem = await Item.create(
        { name, price, catalogId: newCatalog.id },
        { transaction: t }
      );

      const catalogResult = newCatalog.toJSON();
      delete catalogResult.storeId;

      const itemResult = newItem.toJSON();
      delete itemResult.catalogId;
      delete itemResult.imageId;

      return {
        ...catalogResult,
        item: { ...itemResult },
      };
    });

    return res.status(201).json(handleSuccess(result));
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

module.exports.items_put = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  const { name, price, isVisible } = req.body;
  try {
    const store = await Store.findOne({
      where: { userId },
      include: {
        model: Catalog,
        as: 'catalog',
        include: {
          model: Item,
          as: 'item',
          attributes: ['id'],
        },
        attributes: ['id'],
      },
      attributes: ['id'],
    });

    const isUserHasItem = store.catalog.find(
      (catalog) => catalog.item?.id === itemId
    );
    if (!isUserHasItem) throw new ResourceNotFoundError('item not found');

    const updatedItem = (
      await Item.update(
        { name, price, isVisible },
        {
          where: { id: itemId },
          returning: ['id', 'name', 'price', 'is_visible'],
          plain: true,
        }
      )
    )[1];
    if (!updatedItem) throw new OtherError('item not updated');

    return res.status(200).json(handleSuccess(updatedItem));
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
