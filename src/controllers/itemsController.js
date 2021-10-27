const {
  Store,
  Item,
  Catalog,
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
const { uploadImage, deleteImage } = require('../utils/image');
const { CATALOG_ITEM_IMAGE } = require('../utils/IMAGE_TYPE');

module.exports.items_post = async (req, res) => {
  const userId = req.user.id;
  const { name, price } = req.body;
  try {
    const store = await Store.findOne({ where: { userId } });

    if (!store) throw new ResourceNotFoundError('store not found');

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

    const isUserHasItem = store?.catalog?.find(
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

module.exports.items_image_post = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;
  const { image } = req;

  try {
    if (!image) throw new OtherError('please insert an image');

    const store = await Store.findOne({
      where: { userId },
      include: {
        model: Catalog,
        as: 'catalog',
        include: {
          model: Item,
          as: 'item',
          where: { id: itemId },
          include: {
            model: Image,
            as: 'image',
          },
        },
      },
    });

    if (!store) throw new ResourceNotFoundError('item not found');

    const result = await sequelize.transaction(async (t) => {
      const selectedItem = store.catalog[0].item;
      const imageInItem = selectedItem.image;
      if (imageInItem) {
        const selectedImage = await Image.findOne({
          where: { id: imageInItem.id },
          transaction: t,
        });

        await selectedImage.destroy({ transaction: t });
        await deleteImage(selectedImage.path);
      }

      await uploadImage(image);

      const { filename, blurhash, color } = image.info;

      const newImage = await store.createImage(
        {
          userId: store.userId,
          itemId: selectedItem.id,
          type: CATALOG_ITEM_IMAGE,
          path: filename,
          blurhash,
          color,
        },
        { transaction: t }
      );

      const newImageResult = newImage.toJSON();
      delete newImageResult.userId;
      delete newImageResult.itemId;
      delete newImageResult.storeId;
      delete newImageResult.type;

      return { id: selectedItem.id, image: newImageResult };
    });

    return res.status(200).json(handleSuccess(result));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    if (err instanceof OtherError) {
      return res.status(400).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};

module.exports.items_delete = async (req, res) => {
  const userId = req.user.id;
  const itemId = req.params.id;

  try {
    const selectedCatalog = await Catalog.findOne({
      include: [
        { model: Store, as: 'store', where: { userId } },
        {
          model: Item,
          as: 'item',
          where: { id: itemId },
          include: {
            model: Image,
            as: 'image',
            attributes: { exclude: ['userId', 'itemId', 'storeId', 'type'] },
          },
        },
      ],
    });

    if (!selectedCatalog) throw new ResourceNotFoundError('item not found');

    const result = await sequelize.transaction(async (t) => {
      const imageInItem = selectedCatalog.item.image;
      if (imageInItem) {
        const selectedImage = await Image.findOne({
          where: { id: imageInItem.id },
          transaction: t,
        });

        await deleteImage(selectedImage.path);
        await selectedImage.destroy({ transaction: t });
      }

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
        id: selectedCatalog.item.id,
        name: selectedCatalog.item.name,
        price: selectedCatalog.item.price,
        image: selectedCatalog.item.image,
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
