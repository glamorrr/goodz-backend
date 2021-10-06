const {
  Store,
  Item,
  Image,
  Catalog,
  sequelize,
  Sequelize: { ValidationError },
} = require('../models');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');
const uploadImage = require('../utils/uploadImage');

module.exports.items_post = async (req, res) => {
  const userId = req.user.id;
  const { name, price } = req.body;
  const { image } = req;
  const store = await Store.findOne({ where: { userId } });
  try {
    const result = await sequelize.transaction(async (t) => {
      let newImage = null;
      if (image) {
        await uploadImage(image);
        const { filename, blurhash, color } = image.info;
        const createdImage = await Image.create(
          {
            path: filename,
            blurhash,
            color,
            userId: store.userId,
          },
          { transaction: t }
        );
        newImage = createdImage.toJSON();
        delete newImage.userId;
      }

      const newItem = await Item.create(
        { name, price, imageId: newImage.id },
        { transaction: t }
      );
      await Catalog.update(
        { position: sequelize.literal('position + 1') },
        { where: { storeId: store.id }, transaction: t }
      );
      const newCatalog = await Catalog.create(
        { storeId: store.id, itemId: newItem.id },
        { transaction: t }
      );

      const catalogResult = newCatalog.toJSON();
      delete catalogResult.itemId;

      const itemResult = newItem.toJSON();
      delete itemResult.imageId;

      return {
        ...catalogResult,
        item: { ...itemResult, image: newImage },
      };
    });

    return res.status(201).json(handleSuccess({ ...result }));
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
