import * as path from 'path';
import fetch from 'node-fetch';
import * as fse from 'fs-extra';
import log from './log';

function downloadFile(downloadUrl: string, destination: string, channel?: string): Promise<string> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  return new Promise((resolve, reject) => {
    writeLog(`Start to download ${downloadUrl} ...`, channel);
    fetch(downloadUrl).then((res) => {
      const splits = downloadUrl.split('/');
      const name = splits[splits.length - 1];
      const filePath = path.join(destination, name);
      const dest = fse.createWriteStream(filePath);
      res.body
        .pipe(dest)
        .on('finish', () => {
          writeLog(`Download ${downloadUrl} to ${filePath} successfully.`, channel);
          resolve(filePath);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
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
