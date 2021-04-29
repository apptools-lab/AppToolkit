import * as path from 'path';
import * as execa from 'execa';
import log from '../utils/log';
// eslint-disable-next-line import/order
import stripAnsi = require('strip-ansi');

class NvmManager {
  async installNode(version: string, isReinstallPackages = true) {
    const shFilePath = path.resolve(__dirname, '../sh', 'nvm-install-node.sh');
    const reinstallPackagesArg = isReinstallPackages ? '--reinstall-packages-from=current' : '';
    const listenFunc = (buffer: Buffer) => {
      const chunk = buffer.toString();
      log.info(chunk);
    };
    return new Promise((resolve, reject) => {
      const cp = execa('sh', [shFilePath, version, reinstallPackagesArg]);

      cp.stdout.on('data', listenFunc);

      cp.stderr.on('data', listenFunc);

      cp.on('error', (buffer: Buffer) => {
        listenFunc(buffer);
        log.error(buffer.toString());
        reject(buffer.toString());
      });

      cp.on('exit', (code) => {
        resolve(code);
      });
    });
  }

  async getNodeVersionsList() {
    const shFilePath = path.resolve(__dirname, '../sh', 'nvm-node-version.sh');
    const { stdout } = await execa.command(`sh ${shFilePath}`);

    return stdout
      .split('\n')
      .reverse()
      .map((version: string) => stripAnsi(version).trim());
  }
}

export default NvmManager;
