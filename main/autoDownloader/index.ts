import * as path from 'path';
import * as fse from 'fs-extra';
import AutoDownloader from './AutoDownloader';

const packageTypes = ['bases'];

export async function autoDownloadPackages() {
  const data = await fse.readJSON(path.join(__dirname, '../data', 'data.json'));
  // the packages which should be checked for available downloading
  const packageDatas = [];

  packageTypes.forEach((packageType: string) => {
    const packagesInfo = data[packageType] || [];

    for (const packageInfo of packagesInfo) {
      const { downloadUrl, title, version } = packageInfo;
      if (!downloadUrl) {
        continue;
      }
      const extname = path.extname(downloadUrl);
      const packageFileName = `${title}${version ? `-${version}` : ''}${extname}`;
      packageDatas.push({ sourceFileName: packageFileName, downloadUrl });
    }
  });

  await Promise.all(packageDatas.map((packageData) => {
    const autoDownloader = new AutoDownloader();
    return autoDownloader.start(packageData);
  }));
}
