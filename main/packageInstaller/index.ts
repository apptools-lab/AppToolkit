import * as path from 'path';
import downloadFile from '../utils/downloadFile';
import { IPackageInfo } from '../types';
import log from '../utils/log';
import { INSTALL_COMMAND_PACKAGES } from '../constants';
import installCommandToPath from '../utils/installCommandToPath';
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
  for (let i = 0; i < packagesList.length; i++) {
    const packageInfo = packagesList[i];
    try {
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'process' } });

      const { downloadUrl, shellName, type } = packageInfo;
      let packagePath: string;
      if (downloadUrl) {
        packagePath = await downloadFile(downloadUrl, installChannel);
      } else if (shellName) {
        packagePath = path.resolve(__dirname, '../data/shells', shellName);
      }

      if (!packagePath && !NOT_NEED_TO_DOWNLOAD_PACKAGE_TYPE.includes(type)) {
        throw new Error('No package was found.');
      }

      const { name, localPath } = await install({ packagePath, packageInfo, channel: installChannel });
      await installPkgCommandToPath(name, localPath);
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'finish' } });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : error;
      log.error(errMsg);
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'error', errMsg } });
    }
  }

  process.send({ channel: processChannel, data: { status: 'done' } });
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
