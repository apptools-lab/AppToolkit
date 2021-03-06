import * as path from 'path';
import * as AdmZip from 'adm-zip';
import * as decompress from 'decompress';
import { APPLICATIONS_DIR_PATH } from '../constants';
import writeLog from '../utils/writeLog';
import { IPackageManager, PackageInfo } from '../types';

class ZipManager implements IPackageManager {
  channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  install = async (packageInfo: PackageInfo, zipPath: string) => {
    const { id } = packageInfo;
    const ret = { id, localPath: null };

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
    writeLog(this.channel, `Start to unzip ${zipPath}.`);
    await decompress(zipPath, APPLICATIONS_DIR_PATH);
    writeLog(this.channel, `Unzip ${zipPath} to ${APPLICATIONS_DIR_PATH} successfully.`);
  };
}

export default ZipManager;
