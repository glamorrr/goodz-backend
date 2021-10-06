const { writeFile, access } = require('fs').promises;
const { join } = require('path');

const uploadImage = async (image) => {
  await access(join(__dirname, '../../uploads'));
  const destination = join(__dirname, '../../uploads', image.info.filename);
  await writeFile(destination, image.data);
};

module.exports = uploadImage;
