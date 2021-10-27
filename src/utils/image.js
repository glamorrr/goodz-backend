const { writeFile, unlink } = require('fs').promises;
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const uploadFolder =
  process.env.NODE_ENV !== 'test' ? 'uploads' : 'uploads_test';

const uploadImage = async (image) => {
  if (!existsSync(join(__dirname, `../../${uploadFolder}`))) {
    mkdirSync(join(__dirname, `../../${uploadFolder}`));
  }

  const destination = join(
    __dirname,
    `../../${uploadFolder}`,
    image.info.filename
  );
  await writeFile(destination, image.data);
};

const deleteImage = async (imageFileName) => {
  const imagePath = join(__dirname, `../../${uploadFolder}`, imageFileName);

  // Ignore error if there is no file with specified path
  unlink(imagePath);
};

module.exports = { uploadImage, deleteImage };
