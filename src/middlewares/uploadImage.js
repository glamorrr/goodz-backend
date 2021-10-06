const multer = require('multer');
const { handleFail } = require('../utils/handleJSON');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return callback(new Error('file type is not supported'));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 5 * 1000 * 1000,
  },
}).single('image');

module.exports = async (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json(handleFail(err, { message: 'maximum file size is 5 MB' }));
    }

    if (err instanceof multer.MulterError) {
      return res.status(400).json(
        handleFail(err, {
          message: 'oops! something went wrong while uploading image',
        })
      );
    }

    if (err) {
      return res.status(400).json(handleFail(err, { message: err.message }));
    }

    next();
  });
};
