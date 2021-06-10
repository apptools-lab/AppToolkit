import * as path from 'path';
import fetch from 'node-fetch';
import * as fse from 'fs-extra';
import { TOOLKIT_TMP_DIR } from '../constants';
import log from './log';

function downloadFile(downloadUrl: string, destination: string, filename?: string, channel?: string): Promise<string> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  const dest = path.join(destination, filename);

  if (!filename) {
    const splits = downloadUrl.split('/');
    filename = splits[splits.length - 1];
  }

  return new Promise((resolve, reject) => {
    writeLog(`Start to download ${downloadUrl} ...`, channel);

    fetch(downloadUrl).then((res) => {
      const tmpFilePath = path.join(TOOLKIT_TMP_DIR, filename);
      const tmpDest = fse.createWriteStream(tmpFilePath);
      res.body
        .pipe(tmpDest)
        .on('finish', () => {
          writeLog(`Download ${downloadUrl} to ${tmpFilePath} successfully.`, channel);
          resolve(tmpFilePath);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }).then((tmpFilePath: string) => {
    writeLog(`Start Copy ${tmpFilePath} to ${dest}.`, channel);
    return fse.move(tmpFilePath, dest);
  }).then(() => {
    writeLog(`Copy to ${dest} successfully.`, channel);
    return Promise.resolve(dest);
  });
}

function writeLog(chunk: string, channel?: string) {
  log.info(chunk);
  if (channel) {
    // write log to channel
    process.send({ channel, data: { chunk } });
  }
}

export default downloadFile;
