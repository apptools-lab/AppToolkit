import * as path from 'path';
import * as fse from 'fs-extra';
import { IBasePackageInfo } from '../types';
import getPackageFileName from '../utils/getPackageFileName';
import AutoDownloader from './AutoDownloader';

const packageTypes = ['bases'];

export async function autoDownloadPackages() {
  const data = await fse.readJSON(path.join(__dirname, '../data', 'data.json'));
  // the packages which should be checked for available downloading
  const packageDatas = [];

  packageTypes.forEach((packageType: string) => {
    const packagesInfo: IBasePackageInfo[] = data[packageType] || [];

    for (const packageInfo of packagesInfo) {
      const { downloadUrl, platforms } = packageInfo;
      if (!downloadUrl || !platforms.includes(process.platform)) {
        continue;
      }
      const packageFileName = getPackageFileName(packageInfo);
      packageDatas.push({ sourceFileName: packageFileName, downloadUrl });
    }
  });

  await Promise.all(packageDatas.map((packageData) => {
    const autoDownloader = new AutoDownloader();
    return autoDownloader.start(packageData);
  }));
}
