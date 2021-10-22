const cookie = require('cookie');
const { User, Image, sequelize } = require('../models');
const { ResourceNotFoundError, OtherError } = require('../utils/error');
const {
  handleFail,
  handleError,
  handleSuccess,
} = require('../utils/handleJSON');
const { deleteImage } = require('../utils/image');

module.exports.user_delete = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      where: { id: userId },
      include: {
        model: Image,
        as: 'images',
      },
    });

    if (!user) throw new ResourceNotFoundError('user not found');

    const isAuthenticated = await user.isPasswordValid(password);
    if (!isAuthenticated) throw new OtherError('invalid password');

    await sequelize.transaction(async (t) => {
      user.images.forEach(async (image) => {
        await deleteImage(image.path);
      });

      const allImageId = user.images.map(({ id }) => id);
      await Image.destroy({
        where: { id: allImageId },
        transaction: t,
      });

      await user.destroy({ transaction: t });
    });

    res.setHeader('Set-Cookie', cookie.serialize('token', '', { maxAge: 1 }));
    res.status(200).json(handleSuccess({ email: user.email }));
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json(handleFail(null, { message: err.message }));
    }
    if (err instanceof OtherError) {
      return res.status(400).json(handleFail(null, { message: err.message }));
    }

    res.status(500).json(handleError(err));
  }
};
