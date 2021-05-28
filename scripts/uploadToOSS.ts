import * as oss from 'ali-oss';

const ossClient = oss({
  bucket: 'iceworks',
  endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  timeout: '300s',
});

function uploadToOSS(target: string, filePath: string) {
  return new Promise((resolve, reject) => {
    console.log(`[UPLOAD] start to upload ${filePath}.`);
    ossClient
      .put(target, filePath)
      .then(() => {
        console.log(`[UPLOAD] ${filePath} upload success.`);
        resolve(0);
      })
      .catch((e: Error) => {
        console.log(`[ERROR] ${filePath} upload failed.`);
        reject(e.message);
      });
  });
}

export default uploadToOSS;
