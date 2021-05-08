import * as path from 'path';
import * as execa from 'execa';
import { INodeManager } from '../types';
import log from '../utils/log';
import formatWhitespaceInPath from '../utils/formatWhitespaceInPath';
// eslint-disable-next-line import/order
import stripAnsi = require('strip-ansi');

class NvmManager implements INodeManager {
  channel: string;

  constructor(channel = '') {
    this.channel = channel;
  }

  async installNode(version: string, reinstallGlobalDeps = true) {
    const shFilePath = path.resolve(__dirname, '../sh', 'nvm-install-node.sh');
    const reinstallPackagesArg = reinstallGlobalDeps ? '--reinstall-packages-from=current' : '';

    const listenFunc = (buffer: Buffer) => {
      const chunk = buffer.toString();
      process.send({ channel: this.channel, data: { chunk, ln: false } });
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
    const shFilePath = formatWhitespaceInPath(path.resolve(__dirname, '../sh', 'nvm-node-version.sh'));
    const { stdout } = await execa.command(`sh ${shFilePath}`);

    return stdout
      .split('\n')
      .reverse()
      .map((version: string) => stripAnsi.default(version).trim());
  }
}

export default NvmManager;
