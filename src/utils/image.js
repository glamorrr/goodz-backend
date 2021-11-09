const { uploadImageToS3, deleteImageFromS3 } = require('./s3');

const uploadImage = async (image) => {
  await uploadImageToS3(image);
};

const deleteImage = async (imageFileName) => {
  await deleteImageFromS3(imageFileName);
};

module.exports = { uploadImage, deleteImage };
