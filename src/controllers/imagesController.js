const { Image } = require('../models');
const { ResourceNotFoundError } = require('../utils/error');
const {
  handleSuccess,
  handleError,
  handleFail,
} = require('../utils/handleJSON');
const { deleteImage } = require('../utils/image');

module.exports.images_delete = async (req, res) => {
  const imageId = req.params.id;
  const userId = req.user.id;

  try {
    const selectedImage = await Image.findOne({
      where: { userId, id: imageId },
      attributes: ['id', 'path'],
    });
    if (!selectedImage) throw new ResourceNotFoundError('image not found');

    await deleteImage(selectedImage.path);
    await selectedImage.destroy();

    return res.status(200).json(handleSuccess(selectedImage));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }

    return res.status(500).json(handleError(err));
  }
};
