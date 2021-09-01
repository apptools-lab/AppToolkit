import * as path from 'path';
import * as fse from 'fs-extra';
import downloadFile from '../utils/downloadFile';
import { InstallResult, PackageInfo, PackagesData } from '../types';
import log from '../utils/log';
import writeLog from '../utils/writeLog';
import { INSTALL_COMMAND_PACKAGES, TOOLKIT_PACKAGES_DIR } from '../constants';
import installCommandToPath from '../utils/installCommandToPath';
import getPackageFileName from '../utils/getPackageFileName';
import DmgManager from './DmgManager';
import CliManager from './CliManager';
import ZipManager from './ZipManager';
import IDEExtensionManager from './IDEExtensionManager';
import NpmDependencyManager from './NpmDependencyManager';

// avoid error: 'Invalid package /Applications/xxx.app/Contents/Resources/app.asar'
process.noAsar = true;

const packageProcessor = {
  sh: CliManager,
  zip: ZipManager,
  dmg: DmgManager,
  IDEExtension: IDEExtensionManager,
  npmDependency: NpmDependencyManager,
};

const NOT_NEED_TO_DOWNLOAD_PACKAGE_TYPE = ['IDEExtension', 'npmDependency'];

process.on('message', processListener);

function processListener({
  packagesList,
  packagesData,
  installChannel,
  processChannel,
  uninstallChannel,
  type = 'install',
}: {
  packagesList: PackageInfo[];
  packagesData: PackagesData;
  processChannel: string;
  installChannel?: string;
  uninstallChannel?: string;
  type: 'install' | 'uninstall';
}) {
  if (type === 'install') {
    installPackages({ packagesList, packagesData, installChannel, processChannel });
  } else if (type === 'uninstall') {
    uninstallPackages({ packagesList, packagesData, uninstallChannel, processChannel });
  }
}

async function installPackages({
  packagesList,
  packagesData,
  installChannel,
  processChannel,
}: {
  packagesList: PackageInfo[];
  packagesData: PackagesData;
  installChannel: string;
  processChannel: string;
}) {
  const result: InstallResult[] = [];

  for (let i = 0; i < packagesList.length; i++) {
    const packageInfo = packagesList[i];
    const { downloadUrl, shellName, type, id, title } = packageInfo;
    const startTime = Date.now();
    let status;
    let errMsg;
    try {
      process.send({ channel: processChannel, data: { currentIndex: i, id, status: 'process' } });

      let packagePath: string;
      if (downloadUrl) {
        const packageFileName = getPackageFileName(packageInfo);
        const sourceFilePath = path.join(TOOLKIT_PACKAGES_DIR, packageFileName);
        const sourceFileExists = await fse.pathExists(sourceFilePath);
        if (sourceFileExists) {
          // use local package
          writeLog(installChannel, `Use cache ${sourceFilePath} to install package.`);
          packagePath = sourceFilePath;
        } else {
          // download package
          packagePath = await downloadFile(downloadUrl, TOOLKIT_PACKAGES_DIR, packageFileName, installChannel);
        }
      } else if (shellName) {
        packagePath = path.resolve(__dirname, '../data/shells', shellName);
      }

      if (!packagePath && !NOT_NEED_TO_DOWNLOAD_PACKAGE_TYPE.includes(type)) {
        throw new Error('No package was found.');
      }

      process.send({ channel: processChannel, data: { currentIndex: i, id, packagePath, status: 'downloaded' } });

      // install package
      const { localPath } = await install({ packagePath, packageInfo, channel: installChannel, packagesData });
      // install package command
      // e.g: VS Code cli command 'code'
      await installPkgCommandToPath(id, localPath);

      status = 'finish';
      process.send({ channel: processChannel, data: { currentIndex: i, status, id, packagePath } });
    } catch (error) {
      errMsg = error instanceof Error ? error.message : error;
      log.error(error);
      status = 'error';
      process.send({ channel: processChannel, data: { currentIndex: i, status, errMsg, id } });
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

async function install(
  {
    channel,
    packagePath,
    packageInfo,
    packagesData,
  }: {
    channel: string;
    packagePath: string;
    packageInfo: PackageInfo;
    packagesData: PackagesData;
  },
) {
  let processorKey;
  if (packagePath) {
    processorKey = path.extname(packagePath).replace('.', '');
  } else {
    processorKey = packageInfo.type;
  }
  const PackageManager = packageProcessor[processorKey];
  if (PackageManager) {
    const packageManager = new PackageManager(channel, packagesData);
    return await packageManager.install(packageInfo, packagePath);
  }
  return {};
}

async function installPkgCommandToPath(name: string, localPath?: string) {
  if (!localPath) {
    return;
  }
  const res = INSTALL_COMMAND_PACKAGES.find((pkg) => pkg.name === name);
  if (res) {
    const { command, commandRelativePath } = res;
    const source = path.join(localPath, commandRelativePath);
    await installCommandToPath(source, command);
  }
}

async function uninstallPackages(
  {
    packagesList,
    packagesData,
    uninstallChannel,
    processChannel,
  }: {
    packagesList: PackageInfo[];
    packagesData: PackagesData;
    processChannel: string;
    uninstallChannel: string;
  },
) {
  for (const packageInfo of packagesList) {
    const { localPath, type, id } = packageInfo;
    if (localPath && fse.pathExistsSync(localPath)) {
      const PackageManager = packageProcessor[type];
      if (PackageManager) {
        process.send({ channel: processChannel, data: { id, status: 'process' } });

        const packageManager = new PackageManager(uninstallChannel, packagesData);
        try {
          await packageManager.uninstall(packageInfo);
          process.send({ channel: processChannel, data: { id, status: 'finish' } });
        } catch (error) {
          process.send({ channel: processChannel, data: { id, status: 'error', errMsg: error.message } });
        }
      }
    }
  }

  process.send({ channel: processChannel, data: { status: 'done' } });
}
