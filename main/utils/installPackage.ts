import { Mounter } from '@shockpkg/hdi-mac';
import * as fse from 'fs-extra';
import * as globby from 'globby';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import * as decompress from 'decompress';
import * as execa from 'execa';
import * as sudo from 'sudo-prompt';
import { APPLICATIONS_DIR_PATH } from '../constants';
import downloadFile from './downloadFile';
import { IPackageInfo } from '../types';
import executeBashProfileFile from './executeBashProfileFile';
import log from './log';

process.noAsar = true;

const installPackageFuncMap = {
  '.dmg': installDmg,
  '.zip': unzipAndCopyToApplicationsDir,
  '.sh': installSh,
};

async function installPackage(packageInfo: IPackageInfo) {
  const { downloadUrl } = packageInfo;
  // download package to the disk
  const { filePath } = await downloadFile(downloadUrl);
  const extname = path.extname(filePath);
  const installPackageFunc = installPackageFuncMap[extname];
  if (installPackageFunc) {
    await installPackageFunc(filePath, packageInfo);
  }
}

async function installSh(filePath: string, { packageName }: IPackageInfo) {
  if (packageName === 'node') {
    // install node
    await installNvm(filePath);
  }
}

async function installNvm(filePath: string) {
  const nvmDownloadRes = await execa.command(`sh ${filePath}`);
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
  const mountDevice = devices.find((device) => {
    return device.mountPoint;
  });
  let mountPoint;
  if (mountDevice) {
    mountPoint = mountDevice.mountPoint;
  }
  if (!mountPoint) {
    throw new Error(`no mountPoint was found in ${devices}`);
  }
  const appPaths = globby.sync(['*.app', '*.pkg'], { onlyFiles: false, deep: 1, cwd: mountPoint });
  for (const appPath of appPaths) {
    const extname = path.extname(appPath);
    const source = path.join(mountPoint, appPath).replace(/ /g, '\\ ');
    if (extname === '.app') {
      await installApp(source, appPath);
    } else if (extname === '.pkg') {
      await installPkg(source);
    }
  }
  // eject app from disk
  await eject();
}

async function installApp(source: string, appName: string) {
  const dest = path.join(APPLICATIONS_DIR_PATH, appName);
  log.info(`Start to copy ${source} to ${dest}.`);
  // copy xxx.app to `/Applications` dir
  // overwrite: true will upgrade the dmg
  await fse.copy(source, dest, { overwrite: true });
  log.info(`Copy ${source} to ${dest} successfully.`);
}

function installPkg(source: string) {
  const options = { name: 'Appworks Toolkit' };
  log.info(`Start to install pkg ${source}.`);
  return new Promise((resolve, reject) => {
    sudo.exec(
      `installer -pkg ${source} -target ${APPLICATIONS_DIR_PATH}`,
      options,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        if (stderr) {
          reject(stderr);
        }
        if (stdout) {
          log.info(stdout);
          log.info(`Install pkg ${source} successfully.`);
          resolve(stdout);
        }
      },
    );
  });
}

async function unzipAndCopyToApplicationsDir(filePath: string) {
  const zip = new AdmZip(filePath);
  const appEntry = zip.getEntries()[0];
  if (appEntry && /\.app\/?$/.test(appEntry.entryName)) {
    log.info(`Start to unzip ${filePath} to ${APPLICATIONS_DIR_PATH}.`);
    await decompress(filePath, APPLICATIONS_DIR_PATH);
    log.info(`Unzip ${filePath} to ${APPLICATIONS_DIR_PATH} successfully.`);
  }
}

export default installPackage;
