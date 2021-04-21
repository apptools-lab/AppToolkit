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
import { send as sendMainWindow } from '../window';
import writeLog from './writeLog';

process.noAsar = true;

const installPackageFuncMap = {
  '.dmg': installDmg,
  '.zip': unzipAndCopyToApplicationsDir,
  '.sh': installSh,
};

async function installPackage(packageInfo: IPackageInfo, channel: string) {
  const { downloadUrl } = packageInfo;
  // download package to the disk
  const { filePath } = await downloadFile({ url: downloadUrl, channel });
  const extname = path.extname(filePath);
  const installPackageFunc = installPackageFuncMap[extname];
  if (installPackageFunc) {
    await installPackageFunc({ filePath, packageInfo, channel });
  }
}

async function installSh({ filePath, packageInfo, channel }) {
  const { name, options } = packageInfo;
  if (name === 'node') {
    const installNodeFuncMap = {
      nvm: installNvm,
    };
    const { managerName } = options;
    const installNodeFunc = installNodeFuncMap[managerName];
    if (installNodeFunc) {
      await installNodeFunc({ filePath, channel });
    }
  }
}

function installNvm({ filePath, channel }) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    const listenFunc = (buffer: Buffer) => {
      const chunk = buffer.toString();
      stdout += chunk;
      sendMainWindow(channel, chunk);
    };

    const cp = execa('sh', [filePath]);

    cp.stdout.on('data', listenFunc);

    cp.stderr.on('data', listenFunc);

    cp.on('error', (buffer: Buffer) => {
      listenFunc(buffer);
      reject(buffer.toString());
    });

    cp.on('exit', (code) => {
      const matchRes = stdout.match(/^(?:=> Appending nvm source string to|=> nvm source string already in) (.*)/);
      if (matchRes) {
        const nvmBashProfilePath = matchRes[1];
        executeBashProfileFile(nvmBashProfilePath);
      }
      resolve(code);
    });
  });
}

async function installDmg({ filePath, channel }) {
  // mount app to the disk
  const mounter = new Mounter();
  const { devices, eject } = await mounter.attach(filePath);
  const mountDevice = devices.find((device) => {
    return device.mountPoint;
  });
  if (!mountDevice) {
    writeLog(`no mountPoint was found in ${devices}`, { channel, sendWindowMessage: sendMainWindow });
    return;
  }

  const { mountPoint } = mountDevice;
  const appPaths = globby.sync(['*.app', '*.pkg'], { onlyFiles: false, deep: 1, cwd: mountPoint });
  for (const appPath of appPaths) {
    const extname = path.extname(appPath);
    const source = path.join(mountPoint, appPath);
    if (extname === '.app') {
      await installApp(source, appPath, channel);
    } else if (extname === '.pkg') {
      await installPkg(source, channel);
    }
  }
  // eject app from disk
  await eject();
}

async function installApp(source: string, appName: string, channel: string) {
  const dest = path.join(APPLICATIONS_DIR_PATH, appName);
  // copy xxx.app to `/Applications` dir
  await fse.copy(source, dest, { overwrite: true });
  const writeLogOpts = { channel, sendWindowMessage: sendMainWindow };
  writeLog(`Copy ${source} to ${dest} successfully.`, writeLogOpts);
}

function installPkg(source: string, channel: string) {
  const modifiedSource = source.replace(/ /g, '\\ ');
  const options = { name: 'Appworks Toolkit' };
  const writeLogOpts = { channel, sendWindowMessage: sendMainWindow };
  return new Promise((resolve, reject) => {
    sudo.exec(
      `installer -pkg ${modifiedSource} -target ${APPLICATIONS_DIR_PATH}`,
      options,
      (error, stdout, stderr) => {
        if (error) {
          writeLog(error.message, writeLogOpts);
          reject(error);
        }
        if (stderr) {
          writeLog(stderr.toString(), writeLogOpts);
          reject(stderr);
        }
        if (stdout) {
          writeLog(stdout.toString(), writeLogOpts);
          resolve(stdout);
        }
      },
    );
  });
}

async function unzipAndCopyToApplicationsDir({ filePath, channel }) {
  const zip = new AdmZip(filePath);
  const appEntry = zip.getEntries()[0];

  if (appEntry && /\.app\/?$/.test(appEntry.entryName)) {
    await decompress(filePath, APPLICATIONS_DIR_PATH);
    const writeLogOpts = { channel, sendWindowMessage: sendMainWindow };
    writeLog(`Unzip ${filePath} to ${APPLICATIONS_DIR_PATH} successfully.`, writeLogOpts);
  }
}

export default installPackage;
