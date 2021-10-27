const {
  Store,
  Image,
  sequelize,
  Sequelize: { ValidationError, UniqueConstraintError },
} = require('../models');
const { OtherError, ResourceNotFoundError } = require('../utils/error');
const {
  handleSuccess,
  handleFail,
  handleError,
} = require('../utils/handleJSON');
const { deleteImage, uploadImage } = require('../utils/image');
const { STORE_IMAGE, STORE_BACKGROUND } = require('../utils/IMAGE_TYPE');

module.exports.store_get = async (req, res) => {
  const userId = req.user.id;

  try {
    const store = await Store.findOne({
      where: { userId },
      include: {
        model: Image,
        as: 'images',
        attributes: { exclude: ['userId', 'storeId', 'itemId'] },
      },
      attributes: { exclude: ['userId'] },
    });

    if (!store) throw new ResourceNotFoundError('store not found');

    const background =
      store.images.find((image) => image.type === STORE_BACKGROUND)?.toJSON() ||
      null;

    const image =
      store.images.find((image) => image.type === STORE_IMAGE)?.toJSON() ||
      null;

    const storeResult = store.toJSON();
    delete storeResult.images;
    delete background?.type;
    delete image?.type;

    return res
      .status(200)
      .json(handleSuccess({ ...storeResult, background, image }));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};

module.exports.store_profile_put = async (req, res) => {
  const userId = req.user.id;
  const { name, description, location } = req.body;

  try {
    const updatedStore = (
      await Store.update(
        { name, description, location },
        {
          where: { userId },
          returning: ['name', 'description', 'location'],
          plain: true,
        }
      )
    )[1];
    if (!updatedStore) throw new OtherError('profile not updated');

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

module.exports.store_url_put = async (req, res) => {
  const userId = req.user.id;
  const { url } = req.body;

  try {
    const updatedStore = (
      await Store.update(
        { url },
        {
          where: { userId },
          returning: ['url'],
          plain: true,
        }
      )
    )[1];
    if (!updatedStore) throw new OtherError('url not updated');

    res.status(200).json(handleSuccess(updatedStore));
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      const { path } = err.errors[0];
      return res
        .status(400)
        .json(handleFail(err, { [path]: 'url has already been taken' }));
    }

    if (err instanceof ValidationError) {
      const data = {};
      err.errors.forEach(({ path, message }) => {
        data[path] = message;
      });
      return res.status(400).json(handleFail(err, data));
    }

    if (err instanceof OtherError) {
      return res.status(400).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};

module.exports.store_currency_put = async (req, res) => {
  const userId = req.user.id;
  const { currencyCode } = req.body;

  try {
    const updatedStore = (
      await Store.update(
        { currencyCode },
        {
          where: { userId },
          returning: ['currency_code'],
          plain: true,
        }
      )
    )[1];
    if (!updatedStore) throw new OtherError('currency code not updated');

    res.status(200).json(handleSuccess(updatedStore));
  } catch (err) {
    if (err instanceof ValidationError) {
      const data = {};
      err.errors.forEach(({ path, message }) => {
        data[path] = message;
      });
      return res.status(400).json(handleFail(err, data));
    }

    if (err instanceof OtherError) {
      return res.status(400).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};

module.exports.store_image_post = async (req, res) => {
  const userId = req.user.id;
  const { image } = req;

  try {
    if (!image) throw new OtherError('please insert an image');

    const store = await Store.findOne({
      where: { userId },
      include: {
        model: Image,
        as: 'images',
      },
    });

    if (!store) throw new ResourceNotFoundError('store not found');

    const result = await sequelize.transaction(async (t) => {
      const imageInStore = store.images.find(
        (image) => image.type === STORE_IMAGE
      );
      if (imageInStore) {
        const selectedImage = await Image.findOne({
          where: { id: imageInStore.id },
          transaction: t,
        });

        await deleteImage(selectedImage.path);
        await selectedImage.destroy({ transaction: t });
      }

      await uploadImage(image);

      const { filename, blurhash, color } = image.info;

      const newImage = await store.createImage(
        {
          userId: store.userId,
          type: STORE_IMAGE,
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

      return { id: store.id, image: newImageResult };
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

    const store = await Store.findOne({
      where: { userId },
      include: {
        model: Image,
        as: 'images',
      },
    });

    if (!store) throw new ResourceNotFoundError('store not found');

    const result = await sequelize.transaction(async (t) => {
      const backgroundInStore = store.images.find(
        (image) => image.type === STORE_BACKGROUND
      );
      if (backgroundInStore) {
        const selectedImage = await Image.findOne({
          where: { id: backgroundInStore.id },
          transaction: t,
        });

        await deleteImage(selectedImage.path);
        await selectedImage.destroy({ transaction: t });
      }

      await uploadImage(image);

      const { filename, blurhash, color } = image.info;
      const newBackground = await store.createImage(
        {
          userId: store.userId,
          type: STORE_BACKGROUND,
          path: filename,
          blurhash,
          color,
        },
        { transaction: t }
      );

      const newBackgroundResult = newBackground.toJSON();
      delete newBackgroundResult.userId;
      delete newBackgroundResult.itemId;
      delete newBackgroundResult.storeId;
      delete newBackgroundResult.type;

      return { id: store.id, background: newBackgroundResult };
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
