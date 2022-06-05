import fse from 'fs-extra';
import * as path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import consola from 'consola';
import fetch from 'node-fetch';
import { APP_TOOLKIT_TMP_DIR } from '@/constants';

const streamPipeline = promisify(pipeline);

export default async function downloadFile(
  downloadLink: string,
  destination: string,
): Promise<string | undefined> {
  if (!fse.existsSync(destination)) {
    fse.mkdirSync(destination);
  }

  const splits = downloadLink.split('/');
  const filename = splits[splits.length - 1];
  const dest = path.join(destination, filename);
  const tmpFilePath = path.join(APP_TOOLKIT_TMP_DIR, filename);
  const tmpDest = fse.createWriteStream(tmpFilePath);
  const response = await fetch(downloadLink);
  if (response.body) {
    consola.log(`Start to download ${downloadLink} ...`);
    await streamPipeline(response.body, tmpDest);
    consola.log(`Download ${downloadLink} to ${tmpFilePath} successfully.`);

    consola.log(`Start Copy ${tmpFilePath} to ${dest}.`);
    await fse.move(tmpFilePath, dest);
    consola.log(`Copy to ${dest} successfully.`);

    return dest;
  }
}
