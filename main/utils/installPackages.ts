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
import executeBashConfigFile from './executeBashConfigFile';
import log from './log';

process.noAsar = true;

const installPackageFuncMap = {
  '.dmg': installDmg,
  '.zip': unzipAndCopyToApplicationsDir,
  '.sh': installSh,
};

async function install(packageInfo: IPackageInfo, channel: string) {
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
      process.send({ channel, data: { chunk, ln: false } });
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
        executeBashConfigFile(nvmBashProfilePath);
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
    const errMsg = `no mountPoint was found in ${devices}`;
    writeLog(channel, errMsg);
    throw new Error(errMsg);
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
  const chunk = `Copy ${source} to ${dest} successfully.`;
  writeLog(channel, chunk);
}

function installPkg(source: string, channel: string) {
  const modifiedSource = source.replace(/ /g, '\\ ');
  const options = { name: 'Appworks Toolkit' };

  return new Promise((resolve, reject) => {
    sudo.exec(
      `installer -pkg ${modifiedSource} -target ${APPLICATIONS_DIR_PATH}`,
      options,
      (error, stdout, stderr) => {
        if (error) {
          writeLog(channel, error.message);
          reject(error);
        }
        if (stderr) {
          writeLog(channel, stderr.toString());
          reject(stderr);
        }
        if (stdout) {
          writeLog(channel, stdout.toString());
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
    const chunk = `Unzip ${filePath} to ${APPLICATIONS_DIR_PATH} successfully.`;
    writeLog(channel, chunk);
  }
}

function writeLog(channel: string, chunk: string, ln = true) {
  log.info(chunk);
  process.send({ channel, data: { chunk, ln } });
}

function processListener({
  packagesList,
  installChannel,
  processChannel,
}: {
  packagesList: IPackageInfo[];
  installChannel: string;
  processChannel: string;
}) {
  async function installPackages() {
    for (let i = 0; i < packagesList.length; i++) {
      const packageInfo = packagesList[i];
      try {
        process.send({ channel: processChannel, data: { currentIndex: i, status: 'process' } });
        await install(packageInfo, installChannel);
        process.send({ channel: processChannel, data: { currentIndex: i, status: 'finish' } });
      } catch (error) {
        const errMsg = error.message;
        log.info(errMsg);
        process.send({ channel: processChannel, data: { currentIndex: i, status: 'error', errMsg } });
      }
    }

    process.send({ channel: processChannel, data: { status: 'success' } });
  }
  installPackages();
}

process.on('message', processListener);
