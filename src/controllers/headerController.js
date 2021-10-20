const {
  Store,
  Catalog,
  sequelize,
  Header,
  Sequelize: { ValidationError },
} = require('../models');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');

module.exports.header_post = async (req, res) => {
  const userId = req.user.id;
  const { title } = req.body;

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
