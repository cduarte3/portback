const { Storage } = require("@google-cloud/storage");

// Create storage instance with credentials
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  // use keyfilename for local not in cloud console
  // keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
});

// Create  bucket with name from environment variable
const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
const bucket = storage.bucket(bucketName);

module.exports = { bucket };
