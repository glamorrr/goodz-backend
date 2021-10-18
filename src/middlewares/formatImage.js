const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { encode } = require('blurhash');
const Vibrant = require('node-vibrant');
const { handleFail } = require('../utils/handleJSON');

const getFormattedDate = () => {
  const currentDate = new Date();
  const month = currentDate.getUTCMonth() + 1;
  const year = currentDate.getUTCFullYear();
  const result = `${year}_${month}`;
  return result;
};

module.exports = ({ width = 400, height = 400 }) => {
  return async (req, res, next) => {
    if (!req.file) {
      req.image = null;
      return next();
    }

    try {
      const optimizedImage = await sharp(req.file.buffer)
        .resize({ width, height })
        .png({ quality: 70 })
        .toBuffer({ resolveWithObject: true });

      const smallImage = await sharp(optimizedImage.data)
        .resize({ width: 32 })
        .png()
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

      const blurhash = encode(
        new Uint8ClampedArray(smallImage.data),
        smallImage.info.width,
        smallImage.info.height,
        4,
        width === height ? 4 : 3
      );

      const vibrant = await Vibrant.from(optimizedImage.data).getPalette();
      const color = vibrant.Vibrant.hex;

      const generatedFileName = `${getFormattedDate()}_${uuidv4()}.${
        optimizedImage.info.format
      }`;

      req.image = {
        data: optimizedImage.data,
        info: { filename: generatedFileName, blurhash, color },
      };
      next();
    } catch (err) {
      return res
        .status(400)
        .json(
          handleFail(err, 'oops! something went wrong while processing image')
        );
    }
  };
};
