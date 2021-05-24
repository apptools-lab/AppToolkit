import * as path from 'path';
import * as AdmZip from 'adm-zip';
import * as decompress from 'decompress';
import { APPLICATIONS_DIR_PATH } from '../constants';
import writeLog from '../utils/writeLog';
import { IPackageInstaller, IPackageInfo } from '../types';

class ZipInstaller implements IPackageInstaller {
  channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  install = async (packageInfo: IPackageInfo, zipPath: string) => {
    const { name } = packageInfo;
    const ret = { name, localPath: null };

    const zip = new AdmZip(zipPath);
    const appEntry = zip.getEntries()[0];
    if (appEntry) {
      const { entryName } = appEntry;
      if (/\.app\/?$/.test(entryName)) {
        await this.unzipToApplication({ zipPath });
        ret.localPath = path.join(APPLICATIONS_DIR_PATH, entryName);
      }
    }

    return ret;
  };

  unzipToApplication = async ({ zipPath }) => {
    await decompress(zipPath, APPLICATIONS_DIR_PATH);
    const chunk = `Unzip ${zipPath} to ${APPLICATIONS_DIR_PATH} successfully.`;
    writeLog(this.channel, chunk);
  };
}

export default ZipInstaller;
