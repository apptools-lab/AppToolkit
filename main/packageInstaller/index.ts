import * as path from 'path';
import * as fse from 'fs-extra';
import downloadFile from '../utils/downloadFile';
import { IInstallResult, IPackageInfo } from '../types';
import log from '../utils/log';
import writeLog from '../utils/writeLog';
import { INSTALL_COMMAND_PACKAGES, TOOLKIT_PACKAGES_DIR } from '../constants';
import installCommandToPath from '../utils/installCommandToPath';
import getPackageFileName from '../utils/getPackageFileName';
import DmgInstaller from './DmgInstaller';
import CliInstaller from './CliInstaller';
import ZipInstaller from './ZipInstaller';
import IDEExtensionInstaller from './IDEExtensionInstaller';

// avoid error: 'Invalid package /Applications/xxx.app/Contents/Resources/app.asar'
process.noAsar = true;

const packageProcessor = {
  sh: CliInstaller,
  zip: ZipInstaller,
  dmg: DmgInstaller,
  IDEExtension: IDEExtensionInstaller,
};

const NOT_NEED_TO_DOWNLOAD_PACKAGE_TYPE = ['IDEExtension'];

process.on('message', processListener);

function processListener({
  packagesList,
  installChannel,
  processChannel,
}: {
  packagesList: IPackageInfo[];
  installChannel: string;
  processChannel: string;
}) {
  installPackages({ packagesList, installChannel, processChannel });
}

async function installPackages({
  packagesList,
  installChannel,
  processChannel,
}: {
  packagesList: IPackageInfo[];
  installChannel: string;
  processChannel: string;
}) {
  const result: IInstallResult[] = [];

  for (let i = 0; i < packagesList.length; i++) {
    const packageInfo = packagesList[i];
    const { downloadUrl, shellName, type, name, title } = packageInfo;
    const startTime = Date.now();
    let status;
    let errMsg;
    try {
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'process' } });

      let packagePath: string;
      if (downloadUrl) {
        const packageFileName = getPackageFileName(packageInfo);
        const sourceFilePath = path.join(TOOLKIT_PACKAGES_DIR, packageFileName);
        const sourceFileExists = await fse.pathExists(sourceFilePath);
        if (sourceFileExists) {
          writeLog(installChannel, `Use cache ${sourceFilePath} to install package.`);
          packagePath = sourceFilePath;
        } else {
          packagePath = await downloadFile(downloadUrl, TOOLKIT_PACKAGES_DIR, packageFileName, installChannel);
        }
      } else if (shellName) {
        packagePath = path.resolve(__dirname, '../data/shells', shellName);
      }

      if (!packagePath && !NOT_NEED_TO_DOWNLOAD_PACKAGE_TYPE.includes(type)) {
        throw new Error('No package was found.');
      }
      // install package
      const { localPath } = await install({ packagePath, packageInfo, channel: installChannel });
      // install package command
      // e.g: VS Code cli command 'code'
      await installPkgCommandToPath(name, localPath);

      status = 'finish';
      process.send({ channel: processChannel, data: { currentIndex: i, status } });
    } catch (error) {
      errMsg = error instanceof Error ? error.message : error;
      log.error(errMsg);
      status = 'error';
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'error', errMsg } });
    } finally {
      const endTime = Date.now();
      const duration = endTime - startTime;

      result.push({
        title,
        status,
        duration,
        errMsg,
      });
    }
  }

  process.send({ channel: processChannel, data: { status: 'done', result } });
}

async function install({ channel, packagePath, packageInfo }: { channel: string; packagePath: string; packageInfo: IPackageInfo }) {
  let processorKey;
  if (packagePath) {
    processorKey = path.extname(packagePath).replace('.', '');
  } else {
    processorKey = packageInfo.type;
  }
  const Installer = packageProcessor[processorKey];
  if (Installer) {
    const installer = new Installer(channel);
    return await installer.install(packageInfo, packagePath);
  }
}

async function installPkgCommandToPath(name: string, localPath: string | null) {
  const res = INSTALL_COMMAND_PACKAGES.find((pkg) => pkg.name === name);
  if (res) {
    const { command, commandRelativePath } = res;
    const source = path.join(localPath, commandRelativePath);
    await installCommandToPath(source, command);
  }
}
