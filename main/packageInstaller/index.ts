import * as path from 'path';
import downloadFile from '../utils/downloadFile';
import { IPackageInfo } from '../types';
import log from '../utils/log';
import DmgInstaller from './DmgInstaller';
import ShInstaller from './ShInstaller';
import ZipInstaller from './ZipInstaller';

// avoid error `Invalid package /Applications/xxx.app/Contents/Resources/app.asar`
process.noAsar = true;

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

      const { downloadUrl, shellName } = packageInfo;
      let packagePath;
      if (downloadUrl) {
        packagePath = await downloadFile(downloadUrl, installChannel);
      } else if (shellName) {
        packagePath = path.resolve(__dirname, '../main/sh', shellName);
      }

      if (!packagePath) {
        throw new Error('No package was found.');
      }

      await install({ packagePath, packageInfo, channel: installChannel });

      process.send({ channel: processChannel, data: { currentIndex: i, status: 'finish' } });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : error;
      log.error(errMsg);
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'error', errMsg } });
    }
  }
  process.send({ channel: processChannel, data: { status: 'done' } });
}

const packageProcessor = {
  '.sh': ShInstaller,
  '.zip': ZipInstaller,
  '.dmg': DmgInstaller,
};

async function install({ channel, packagePath, packageInfo }: { channel: string; packagePath: string; packageInfo: IPackageInfo }) {
  const extname = path.extname(packagePath);
  const Installer = packageProcessor[extname];
  const installer = new Installer(channel);
  await installer.install(packagePath, packageInfo);
}
