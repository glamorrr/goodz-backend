const Minio = require('minio');

const s3 = new Minio.Client({
  endPoint: process.env.S3_ENDPOINT,
  accessKey: process.env.S3_ACCESS_KEY,
  secretKey: process.env.S3_SECRET_ACCESS_KEY,
});

const policy = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${process.env.S3_BUCKET_NAME}/*`,
    },
  ],
});

const setS3BucketPolicy = async () => {
  const isBucketExist = await s3.bucketExists(process.env.S3_BUCKET_NAME);

  if (!isBucketExist) {
    await s3.makeBucket(process.env.S3_BUCKET_NAME);
    await s3.setBucketPolicy(process.env.S3_BUCKET_NAME, policy);
  }
};

const uploadImageToS3 = async ({ data, info: { filename, format, size } }) => {
  await s3.putObject(process.env.S3_BUCKET_NAME, filename, data, size, {
    'Content-Type': `image/${format}`,
  });
};

const deleteImageFromS3 = async (filename) => {
  await s3.removeObject(process.env.S3_BUCKET_NAME, filename);
};

module.exports = {
  uploadImageToS3,
  deleteImageFromS3,
  setS3BucketPolicy,
};
