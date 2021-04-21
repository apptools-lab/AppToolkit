import fetch from 'node-fetch';
import * as fse from 'fs-extra';
import * as path from 'path';
import log from './log';
import { TOOLKIT_TMP_DIR } from '../constants';

function downloadFile({ url, destination = TOOLKIT_TMP_DIR, channel }): Promise<{ filePath: string }> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  return new Promise((resolve, reject) => {
    writeLog(channel, `Downloading ${url} ...`);
    fetch(url).then((res) => {
      const splits = url.split('/');
      const name = splits[splits.length - 1];
      const filePath = path.join(destination, name);
      const dest = fse.createWriteStream(filePath);
      res.body
        .pipe(dest)
        .on('finish', () => {
          writeLog(channel, `Download ${url} to ${filePath} successfully.`);
          resolve({ filePath });
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
