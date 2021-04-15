import { Mounter } from '@shockpkg/hdi-mac';
import * as fse from 'fs-extra';
import * as globby from 'globby';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import * as decompress from 'decompress';
import { APPLICATIONS_DIR_PATH } from '../constants';
import downloadFile from './downloadFile';

process.noAsar = true;

const installPackageFuncMap = {
  '.dmg': installDmg,
  '.zip': unzipAndCopyToApplication,
};

async function installPackage(downloadUrl: string) {
  // download package to the disk
  const { filePath } = await downloadFile(downloadUrl);
  console.log('filePath:', filePath);
  // const filePath = path.join('/Users/luhc228/.toolkit', 'VSCode-darwin-universal.zip');
  const extname = path.extname(filePath);
  // install package
  const installPackageFunc = installPackageFuncMap[extname];
  if (installPackageFunc) {
    await installPackageFunc(filePath);
  }
}

async function installDmg(filePath: string) {
  // mount app to the disk
  const mounter = new Mounter();
  const { devices, eject } = await mounter.attach(filePath);
  const { mountPoint } = devices[0];
  const paths = globby.sync('*.app', { onlyFiles: false, deep: 1, cwd: mountPoint });
  if (paths.length) {
    // copy the the `/Applications` dir
    fse.copySync(mountPoint, APPLICATIONS_DIR_PATH);
  }
  // eject app from disk
  await eject();
}

async function unzipAndCopyToApplication(filePath: string) {
  console.log('unzipAndCopyToApplication');
  const zip = new AdmZip(filePath);
  console.log('zip: ', zip);

  const appEntry = zip.getEntries()[0];
  if (appEntry && /\.app\/?$/.test(appEntry.entryName)) {
    await decompress(filePath, APPLICATIONS_DIR_PATH);
  }
}

export default installPackage;
