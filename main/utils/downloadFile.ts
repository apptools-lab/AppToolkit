import fetch from 'node-fetch';
import * as fse from 'fs-extra';
import * as path from 'path';
import { send as sendMainWindow } from '../window';
import wirteLog from './writeLog';
import { TOOLKIT_TMP_DIR } from '../constants';

function downloadFile({ url, destination = TOOLKIT_TMP_DIR, channel }): Promise<{ filePath: string }> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  return new Promise((resolve, reject) => {
    wirteLog(
      `Downloading ${url}...`,
      { sendWindowMessage: sendMainWindow, channel },
    );
    fetch(url).then((res) => {
      const splits = url.split('/');
      const name = splits[splits.length - 1];
      const filePath = path.join(destination, name);
      const dest = fse.createWriteStream(filePath);
      res.body
        .pipe(dest)
        .on('finish', () => {
          wirteLog(
            `Download ${url} to ${filePath} successfully.`,
            { sendWindowMessage: sendMainWindow, channel },
          );
          resolve({ filePath });
        })
        .on('error', (err) => {
          wirteLog(
            err.message,
            { sendWindowMessage: sendMainWindow, channel },
          );
          reject(err);
        });
    });
  });
}


export default downloadFile;
