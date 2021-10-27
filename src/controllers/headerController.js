const {
  Store,
  Catalog,
  sequelize,
  Header,
  Sequelize: { ValidationError, Op },
} = require('../models');
const { ResourceNotFoundError, OtherError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.header_post = async (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;

  try {
    const store = await Store.findOne({
      where: { userId },
      include: 'catalog',
    });

    if (!store) throw new ResourceNotFoundError('store not found');

    if (store.catalog.length >= 100) {
      throw new OtherError(
        'You have reached your limit! Maximum catalog is 100.'
      );
    }

    const result = await sequelize.transaction(async (t) => {
      await Catalog.update(
        { position: sequelize.literal('position + 1') },
        { where: { storeId: store.id }, transaction: t }
      );
      const newCatalog = await Catalog.create(
        { storeId: store.id },
        { transaction: t }
      );
      const newHeader = await Header.create(
        { title, catalogId: newCatalog.id },
        { transaction: t }
      );

      const catalogResult = newCatalog.toJSON();
      delete catalogResult.storeId;

      const headerResult = newHeader.toJSON();
      delete headerResult.catalogId;

      return {
        ...catalogResult,
        header: headerResult,
      };
    });

    return res.status(201).json(handleSuccess(result));
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

    return res.status(500).json(handleError(err));
  }
};

module.exports.header_put = async (req, res) => {
  const userId = req.user.id;
  const headerId = req.params.id;
  const { title, isVisible } = req.body;

  try {
    const store = await Store.findOne({
      where: { userId },
      include: {
        model: Catalog,
        as: 'catalog',
        include: {
          model: Header,
          as: 'header',
          attributes: ['id'],
        },
        attributes: ['id'],
      },
      attributes: ['id'],
    });

    const isUserHasHeader = store?.catalog?.find(
      (catalog) => catalog.header?.id === headerId
    );
    if (!isUserHasHeader) throw new ResourceNotFoundError('header not found');

    const updatedHeader = (
      await Header.update(
        { title, isVisible },
        {
          where: { id: headerId },
          returning: ['id', 'title', 'is_visible'],
          plain: true,
        }
      )
    )[1];
    if (!updatedHeader) throw new OtherError('header not updated');

    return res.status(200).json(handleSuccess(updatedHeader));
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

module.exports.header_delete = async (req, res) => {
  const userId = req.user.id;
  const headerId = req.params.id;

  try {
    const selectedCatalog = await Catalog.findOne({
      include: [
        { model: Store, as: 'store', where: { userId } },
        {
          model: Header,
          as: 'header',
          where: { id: headerId },
        },
      ],
    });
    if (!selectedCatalog) throw new ResourceNotFoundError('header not found');

    const result = await sequelize.transaction(async (t) => {
      await Catalog.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            storeId: selectedCatalog.storeId,
            position: { [Op.gt]: selectedCatalog.position },
          },
          transaction: t,
        }
      );

      await selectedCatalog.destroy({ transaction: t });

      return {
        id: selectedCatalog.header.id,
        title: selectedCatalog.header.title,
      };
    });

    return res.status(200).json(handleSuccess(result));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};
