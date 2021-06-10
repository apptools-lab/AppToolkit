import * as path from 'path';
import * as fse from 'fs-extra';
import { TOOLKIT_PACKAGES_DIR } from '../constants';
import downloadFile from '../utils/downloadFile';
import log from '../utils/log';

class AutoDownloader {
  async checkForDownloadAvailable(sourceFileName: string) {
    const sourceFilePath = path.join(TOOLKIT_PACKAGES_DIR, sourceFileName);
    const sourceFileExists = await fse.pathExists(sourceFilePath);
    log.info(sourceFileExists ? `${sourceFileName} has already existed in ${sourceFilePath}` : `${sourceFileName} is available to download.`);
    return !sourceFileExists;
  }

  async downloadPackage({ downloadUrl, sourceFileName }) {
    await downloadFile(downloadUrl, TOOLKIT_PACKAGES_DIR, sourceFileName);
  }

  async start(data) {
    const { sourceFileName } = data;
    const downloadAvailable = await this.checkForDownloadAvailable(sourceFileName);
    if (downloadAvailable) {
      await this.downloadPackage(data);
    }
  }
}

export default AutoDownloader;
