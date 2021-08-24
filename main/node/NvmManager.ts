import * as path from 'path';
import * as execa from 'execa';
import { NodeManager } from '../types';
import log from '../utils/log';
import formatNodeVersion from '../utils/formatNodeVersion';
import getShellName from '../utils/getShellName';

class NvmManager implements NodeManager {
  channel: string;

  std: string;

  nodePath: string;

  constructor(channel = '') {
    this.channel = channel;
    this.std = '';
    this.nodePath = '';
  }

  installNode = (version: string) => {
    const formattedVersion = formatNodeVersion(version);
    const shFilePath = path.resolve(__dirname, '../data/shells', 'nvm-install-node.sh');

    return new Promise((resolve, reject) => {
      const args: string[] = [shFilePath, formattedVersion];
      const cp = execa(getShellName(), args);

      cp.stdout.on('data', this.listenFunc);

      cp.stderr.on('data', this.listenFunc);

      cp.on('error', (buffer: Buffer) => {
        this.listenFunc(buffer);
        log.error(new Error(buffer.toString()));
        reject(buffer.toString());
      });

      cp.on('exit', () => {
        const nodePath = this.getCurrentNodePath(this.std);
        const npmVersion = this.getCurrentNpmVersion(this.std);
        this.nodePath = nodePath;
        resolve({ nodeVersion: formattedVersion, npmVersion, nodePath });
      });
    });
  };

  private listenFunc = (buffer: Buffer) => {
    const chunk = buffer.toString();
    this.std += chunk;
    process.send({ channel: this.channel, data: { chunk, ln: false } });
  };

  private getCurrentNodePath(chunk: string) {
    const matchResult = chunk.match(/Current Node Path: (.*)\./);
    if (matchResult) {
      return matchResult[1];
    }
    return undefined;
  }

  private getCurrentNpmVersion(chunk: string) {
    const matchResult = chunk.match(/Current NPM Version: (.*)\./);
    if (matchResult) {
      return matchResult[1];
    }
    return undefined;
  }
}

export default NvmManager;
