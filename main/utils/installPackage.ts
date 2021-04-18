import { Mounter } from '@shockpkg/hdi-mac';
import * as fse from 'fs-extra';
import * as globby from 'globby';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import * as decompress from 'decompress';
import * as execa from 'execa';
import { APPLICATIONS_DIR_PATH } from '../constants';
import downloadFile from './downloadFile';
import { IBasePackageInfo } from '../types';
import executeBashProfileFile from './executeBashProfileFile';

process.noAsar = true;

const installPackageFuncMap = {
  '.dmg': installDmg,
  '.zip': unzipAndCopyToApplication,
};

async function installPackage(packageInfo: IBasePackageInfo) {
  const { downloadUrl, type } = packageInfo;
  // download package to the disk

  if (type === 'node') {
    // install node
    const { filePath: managerInstallShellPath } = await downloadFile(downloadUrl);
    // const { filePath: nodeInstallShellPath } = await downloadFile(nodeInstall);
    console.log('start install node', managerInstallShellPath);
    await installNvm(managerInstallShellPath);
  } else {
    const { filePath } = await downloadFile(downloadUrl as string);
    // install dmg package
    const extname = path.extname(filePath);
    const installPackageFunc = installPackageFuncMap[extname];
    if (installPackageFunc) {
      await installPackageFunc(filePath);
    }
  }
}

async function executeSh(filePath: string) {
  return await execa.command(`sh ${filePath}`);
}

async function installNvm(filePath: string) {
  const nvmDownloadRes = await executeSh(filePath);
  if (nvmDownloadRes) {
    const nvmDownloadStdout = nvmDownloadRes.stdout;
    const matchRes = nvmDownloadStdout.match(/^(?:=> Appending nvm source string to|=> nvm source string already in) (.*)/);
    if (matchRes) {
      const nvmBashProfilePath = matchRes[1];
      executeBashProfileFile(nvmBashProfilePath);
    }
  }
}

async function installDmg(filePath: string) {
  // mount app to the disk
  const mounter = new Mounter();
  const { devices, eject } = await mounter.attach(filePath);
  const { mountPoint } = devices[0];
  const paths = globby.sync('*.app', { onlyFiles: false, deep: 1, cwd: mountPoint });
  if (paths.length) {
    // copy xxx.app to `/Applications` dir
    const appName = paths[0];
    const source = path.join(mountPoint, appName);
    const dest = path.join(APPLICATIONS_DIR_PATH, appName);
    console.log(`[appworks-toolkit] Start to copy ${source} to ${dest}.`);
    // overwrite: true will upgrade the dmg
    fse.copySync(source, dest, { overwrite: true });
    console.log(`[appworks-toolkit] Copy ${source} to ${dest} successfully.`);
  }
  // eject app from disk
  await eject();
}

async function unzipAndCopyToApplication(filePath: string) {
  const zip = new AdmZip(filePath);
  const appEntry = zip.getEntries()[0];
  if (appEntry && /\.app\/?$/.test(appEntry.entryName)) {
    console.log(`[appworks-toolkit] Start to unzip ${filePath} to ${APPLICATIONS_DIR_PATH}.`);
    await decompress(filePath, APPLICATIONS_DIR_PATH);
    console.log(`[appworks-toolkit] Unzip ${filePath} to ${APPLICATIONS_DIR_PATH} successfully.`);
  }
}

export default installPackage;
