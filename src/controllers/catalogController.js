const { Store, Item, Image } = require('../models');
const { handleSuccess, handleError } = require('../utils/handleJSON');

module.exports.catalog_get = async (req, res) => {
  const userId = req.user.id;
  try {
    const store = await Store.findOne({ where: { userId } });
    const catalog = await store.getCatalog({
      include: {
        model: Item,
        as: 'item',
        include: {
          model: Image,
          as: 'image',
          attributes: { exclude: ['userId'] },
        },
        attributes: { exclude: ['imageId', 'catalogId'] },
      },
      order: ['position'],
      attributes: { exclude: ['storeId'] },
    });

    return res.status(200).json(handleSuccess(catalog));
  } catch (err) {
    return res.status(500).json(handleError(err));
  }
};
