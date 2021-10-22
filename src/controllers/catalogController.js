const {
  Store,
  Catalog,
  Item,
  Header,
  Image,
  sequelize,
  Sequelize: { ValidationError, Op },
} = require('../models');
const { ResourceNotFoundError, OtherError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.catalog_get = async (req, res) => {
  const userId = req.user.id;
  try {
    const catalog = await Catalog.findAll({
      include: [
        { model: Store, as: 'store', where: { userId }, attributes: [] },
        {
          model: Item,
          as: 'item',
          include: {
            model: Image,
            as: 'image',
            attributes: { exclude: ['userId'] },
          },
          attributes: { exclude: ['imageId', 'catalogId'] },
        },
        {
          model: Header,
          as: 'header',
          attributes: { exclude: ['catalogId'] },
        },
      ],
      order: ['position'],
      attributes: { exclude: ['storeId'] },
    });

    return res.status(200).json(handleSuccess(catalog));
  } catch (err) {
    return res.status(500).json(handleError(err));
  }
};

module.exports.catalog_position_put = async (req, res) => {
  const userId = req.user.id;
  const catalogId = req.params.id;
  const { position } = req.body;

  try {
    const store = await Store.findOne({ where: { userId } });

    if (!store) throw new ResourceNotFoundError('catalog not found');

    const selectedCatalog = await Catalog.findOne({
      where: { id: catalogId, storeId: store.id },
    });
    if (!selectedCatalog) throw new ResourceNotFoundError('catalog not found');

    const isPositionValid = await store.isCatalogPositionValid(position);
    if (!isPositionValid) {
      throw new OtherError('oops! failed to change catalog position');
    }

    await sequelize.transaction(async (t) => {
      await Catalog.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            position: { [Op.gt]: selectedCatalog.position },
            storeId: store.id,
          },
          transaction: t,
        }
      );
      await Catalog.update(
        { position: sequelize.literal('position + 1') },
        {
          where: {
            position: { [Op.gte]: position },
            storeId: store.id,
          },
          transaction: t,
        }
      );
      const updatedCatalog = (
        await Catalog.update(
          { position },
          {
            where: { id: selectedCatalog.id, storeId: store.id },
            returning: true,
            plain: true,
            transaction: t,
          }
        )
      )[1];

      if (!updatedCatalog) throw new OtherError('catalog not updated');
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
