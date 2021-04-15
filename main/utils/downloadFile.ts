import fetch from 'node-fetch';
import * as fse from 'fs-extra';
import * as path from 'path';

const defaultDestination = path.join(process.env.HOME, '.toolkit');

function downloadFile(url: string, destination = defaultDestination): Promise<{ filePath: string }> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  return new Promise((resolve, reject) => {
    console.log(`[appworks-toolkit] Start to download ${url}.`);
    fetch(url).then((res) => {
      const splits = url.split('/');
      const name = splits[splits.length - 1];
      const filePath = path.join(destination, name);
      const dest = fse.createWriteStream(filePath);
      res.body
        .pipe(dest)
        .on('finish', () => {
          console.log(`Download ${url} to ${filePath} successfully.`);
          resolve({ filePath });
        }).on('error', (err) => {
          reject(err);
        });
    });
  });
}


export default downloadFile;
