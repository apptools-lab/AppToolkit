import * as path from 'path';
import downloadFile from '../utils/downloadFile';
import { IPackageInfo } from '../types';
import log from '../utils/log';
import PackageInstaller from './PackageInstaller';

// escape error `Invalid package /Applications/xxx.app/Contents/Resources/app.asar`
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
  const packageInstaller = new PackageInstaller(installChannel);

  async function installPackages() {
    const installError = [];
    for (let i = 0; i < packagesList.length; i++) {
      const packageInfo = packagesList[i];
      try {
        process.send({ channel: processChannel, data: { currentIndex: i, status: 'process' } });

        const { downloadUrl, shellPath } = packageInfo;
        let filePath;
        if (downloadUrl) {
          filePath = await downloadFile(downloadUrl, installChannel);
        } else if (shellPath) {
          filePath = path.resolve(__dirname, '../sh', shellPath);
        }

        await packageInstaller.install(filePath, packageInfo);

        process.send({ channel: processChannel, data: { currentIndex: i, status: 'finish' } });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : error;
        log.info(errMsg);
        process.send({ channel: processChannel, data: { currentIndex: i, status: 'error', errMsg } });
        installError.push(errMsg);
      }
    }

    if (installError.length) {
      process.send({ channel: processChannel, data: { status: 'fail', error: JSON.stringify(installError) } });
    } else {
      process.send({ channel: processChannel, data: { status: 'success' } });
    }
  }
  installPackages();
}

process.on('message', processListener);
