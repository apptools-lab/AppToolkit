import * as oss from 'ali-oss';

const ossClient = oss({
  bucket: 'iceworks',
  endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  accessKeyId: process.env.ACCESS_KEY_ID,
  accessKeySecret: process.env.ACCESS_KEY_SECRET,
  timeout: '300s',
});

function uploadToOSS(ossObjectName: string, localPath: string) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-console
    console.log(`[UPLOAD] start to upload ${localPath}.`);
    ossClient
      .put(ossObjectName, localPath)
      .then(() => {
        // eslint-disable-next-line no-console
        console.log(`[UPLOAD] ${localPath} upload success.`);
        resolve(0);
      })
      .catch((e: Error) => {
        // eslint-disable-next-line no-console
        console.log(`[ERROR] ${localPath} upload failed.`);
        reject(e.message);
      });
  });
}

export default uploadToOSS;
