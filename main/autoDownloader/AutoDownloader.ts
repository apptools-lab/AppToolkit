import * as path from 'path';
import * as fse from 'fs-extra';
import { TOOLKIT_TMP_DIR, TOOLKIT_PACKAGES_DIR } from '../constants';
import downloadFile from '../utils/downloadFile';

class AutoDownloader {
  async checkForDownload(sourceFileName: string) {
    return !await fse.pathExists(path.join(TOOLKIT_PACKAGES_DIR, sourceFileName));
  }

  async downloadPackage(data) {
    const { sourceFileName, downloadUrl } = data;
    // download package to ~/.toolkit/.tmp
    const localSourcePath = await downloadFile(downloadUrl, TOOLKIT_TMP_DIR);
    // copy it to ~/.toolkit/packages
    const dest = path.join(TOOLKIT_PACKAGES_DIR, sourceFileName);
    await fse.move(localSourcePath, dest);
  }

  async start(data) {
    const { sourceFileName } = data;
    const downloadAvailable = await this.checkForDownload(sourceFileName);
    if (downloadAvailable) {
      await this.downloadPackage(data);
    }
  }
}

export default AutoDownloader;
