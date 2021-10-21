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

module.exports.store_get = async (req, res) => {
  const userId = req.user.id;

  try {
    const store = await Store.findOne({
      where: { userId },
      include: [
        {
          model: Image,
          as: 'image',
          attributes: { exclude: ['userId'] },
        },
        {
          model: Image,
          as: 'background',
          attributes: { exclude: ['userId'] },
        },
      ],
      attributes: { exclude: ['userId', 'imageId', 'backgroundId'] },
    });

    return res.status(200).json(handleSuccess(store));
  } catch (err) {
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
