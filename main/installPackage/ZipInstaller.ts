import * as AdmZip from 'adm-zip';
import { APPLICATIONS_DIR_PATH } from '../constants';
import * as decompress from 'decompress';
import writeLog from './writeLog';

class ZipInstaller {
  channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  install = async (zipPath: string) => {
    const zip = new AdmZip(zipPath);
    const appEntry = zip.getEntries()[0];
    if (appEntry) {
      const { entryName } = appEntry;
      if (/\.app\/?$/.test(entryName)) {
        await this.installApp({ zipPath });
      }
    }
  };

  installApp = async ({ zipPath }) => {
    await decompress(zipPath, APPLICATIONS_DIR_PATH);
    const chunk = `Unzip ${zipPath} to ${APPLICATIONS_DIR_PATH} successfully.`;
    writeLog(this.channel, chunk);
  };
}

export default ZipInstaller;
