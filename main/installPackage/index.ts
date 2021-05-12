import * as path from 'path';
import downloadFile from '../utils/downloadFile';
import { IPackageInfo } from '../types';
import log from '../utils/log';
import PackageInstaller from './PackageInstaller';

// avoid error `Invalid package /Applications/xxx.app/Contents/Resources/app.asar`
process.noAsar = true;

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
  const installError = [];

  for (let i = 0; i < packagesList.length; i++) {
    const packageInfo = packagesList[i];
    try {
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'process' } });

      const { downloadUrl, shellPath } = packageInfo;
      let packagePath;
      if (downloadUrl) {
        packagePath = await downloadFile(downloadUrl, installChannel);
      } else if (shellPath) {
        packagePath = path.resolve(__dirname, '../sh', shellPath);
      }

      if (!packagePath) {
        throw new Error('No package was found.');
      }

      const packageInstaller = new PackageInstaller(installChannel);

      await packageInstaller.install(packagePath, packageInfo);

      process.send({ channel: processChannel, data: { currentIndex: i, status: 'finish' } });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : error;
      log.error(errMsg);
      process.send({ channel: processChannel, data: { currentIndex: i, status: 'error', errMsg } });
    }
  }
  process.send({ channel: processChannel, data: { status: 'done' } });
}

process.on('message', processListener);
