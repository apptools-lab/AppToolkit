import * as path from 'path';
import fetch from 'node-fetch';
import * as fse from 'fs-extra';
import { TOOLKIT_TMP_DIR } from '../constants';
import log from './log';

function downloadFile(downloadUrl: string, channel: string, destination = TOOLKIT_TMP_DIR): Promise<string> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  return new Promise((resolve, reject) => {
    writeLog(channel, `Downloading ${downloadUrl} ...`);
    fetch(downloadUrl).then((res) => {
      const splits = downloadUrl.split('/');
      const name = splits[splits.length - 1];
      const filePath = path.join(destination, name);
      const dest = fse.createWriteStream(filePath);
      res.body
        .pipe(dest)
        .on('finish', () => {
          writeLog(channel, `Download ${downloadUrl} to ${filePath} successfully.`);
          resolve(filePath);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  });
}

function writeLog(channel: string, chunk: string) {
  log.info(chunk);
  process.send({ channel, data: { chunk } });
}

export default downloadFile;
