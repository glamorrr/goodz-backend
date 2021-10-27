const { Store, Image, Item, Header } = require('../models');
const { ResourceNotFoundError } = require('../utils/error');
const {
  handleSuccess,
  handleError,
  handleFail,
} = require('../utils/handleJSON');
const { STORE_BACKGROUND, STORE_IMAGE } = require('../utils/IMAGE_TYPE');

module.exports.url_get = async (req, res) => {
  const { url } = req.params;

  try {
    const store = await Store.findOne({
      where: { url },
      include: {
        model: Image,
        as: 'images',
        attributes: { exclude: ['userId', 'storeId', 'itemId'] },
      },
      attributes: { exclude: ['userId', 'imageId', 'backgroundId'] },
    });

    if (!store) throw new ResourceNotFoundError('url not found');

    const links = await store.getLinks({
      order: ['position'],
      attributes: { exclude: ['storeId'] },
    });

    const catalog = await store.getCatalog({
      order: ['position'],
      attributes: { exclude: ['storeId'] },
      include: [
        {
          model: Item,
          as: 'item',
          attributes: { exclude: ['catalogId', 'imageId'] },
          include: {
            model: Image,
            as: 'image',
            attributes: { exclude: ['userId', 'itemId', 'storeId', 'type'] },
          },
        },
        {
          model: Header,
          as: 'header',
          attributes: { exclude: ['catalogId'] },
        },
      ],
    });

    const background =
      store.images.find((image) => image.type === STORE_BACKGROUND)?.toJSON() ||
      null;
    delete background?.type;

    const image =
      store.images.find((image) => image.type === STORE_IMAGE)?.toJSON() ||
      null;
    delete image?.type;

    const storeResult = store.toJSON();
    delete storeResult.images;

    return res
      .status(200)
      .json(
        handleSuccess({ ...storeResult, background, image, links, catalog })
      );
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};
