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
