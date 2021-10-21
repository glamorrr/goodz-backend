const {
  Store,
  Image,
  sequelize,
  Sequelize: { ValidationError },
} = require('../models');
const { OtherError, ResourceNotFoundError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');
const { deleteImage, uploadImage } = require('../utils/image');

module.exports.store_is_credit_put = async (req, res) => {
  const userId = req.user.id;
  const { isCredit } = req.body;

  try {
    const updatedStore = (
      await Store.update(
        { isCredit },
        {
          where: { userId },
          returning: ['is_credit'],
          plain: true,
        }
      )
    )[1];
    if (!updatedStore) throw new OtherError('isCredit not updated');

    res.status(200).json(handleSuccess(updatedStore));
  } catch (err) {
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

    res.status(500).json(handleError(err));
  }
};

module.exports.store_image_post = async (req, res) => {
  const userId = req.user.id;
  const { image } = req;

  try {
    if (!image) throw new OtherError('please insert an image');

    const store = await Store.findOne({ where: { userId } });

    const result = await sequelize.transaction(async (t) => {
      const isImageInStore = store.imageId;
      if (isImageInStore) {
        const selectedImage = await Image.findOne({
          where: { id: store.imageId },
          attributes: ['id', 'path', 'blurhash', 'color'],
          transaction: t,
        });

        await deleteImage(selectedImage.path);
        await selectedImage.destroy({ transaction: t });
      }

      await uploadImage(image);

      const { filename, blurhash, color } = image.info;
      const newImage = await Image.create(
        {
          path: filename,
          blurhash,
          color,
          userId: store.userId,
        },
        { transaction: t }
      );

      const updatedStore = (
        await Store.update(
          { imageId: newImage.id },
          {
            where: { id: store.id },
            returning: true,
            plain: true,
            transaction: t,
          }
        )
      )[1];
      if (!updatedStore) throw new OtherError('store image not updated');

      const newImageResult = newImage.toJSON();
      delete newImageResult.userId;

      return { id: updatedStore.id, image: newImageResult };
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

module.exports.store_background_post = async (req, res) => {
  const userId = req.user.id;
  const { image } = req;

  try {
    if (!image) throw new OtherError('please insert an image');

    const store = await Store.findOne({ where: { userId } });

    const result = await sequelize.transaction(async (t) => {
      const isImageInStore = store.backgroundId;
      if (isImageInStore) {
        const selectedImage = await Image.findOne({
          where: { id: store.backgroundId },
          attributes: ['id', 'path', 'blurhash', 'color'],
          transaction: t,
        });

        await deleteImage(selectedImage.path);
        await selectedImage.destroy({ transaction: t });
      }

      await uploadImage(image);

      const { filename, blurhash, color } = image.info;
      const newImage = await Image.create(
        {
          path: filename,
          blurhash,
          color,
          userId: store.userId,
        },
        { transaction: t }
      );

      const updatedStore = (
        await Store.update(
          { backgroundId: newImage.id },
          {
            where: { id: store.id },
            returning: true,
            plain: true,
            transaction: t,
          }
        )
      )[1];
      if (!updatedStore) throw new OtherError('store background not updated');

      const newImageResult = newImage.toJSON();
      delete newImageResult.userId;

      return { id: updatedStore.id, background: newImageResult };
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
