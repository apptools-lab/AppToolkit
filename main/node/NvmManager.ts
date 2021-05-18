import * as path from 'path';
import * as execa from 'execa';
import { INodeManager } from '../types';
import log from '../utils/log';
import formatWhitespaceInPath from '../utils/formatWhitespaceInPath';
import formatNodeVersion from '../utils/formatNodeVersion';
// eslint-disable-next-line import/order
import stripAnsi = require('strip-ansi');

class NvmManager implements INodeManager {
  channel: string;

  std: string;

  globalNpmPackages: string[];

  nodePath: string;

  constructor(channel = '') {
    this.channel = channel;
    this.std = '';
    this.globalNpmPackages = [];
    this.nodePath = '';
  }

  installNode = (version: string, reinstallGlobalDeps = true) => {
    if (reinstallGlobalDeps) {
      // collect the global npm packages
      const args: string[] = ['list', '-g', '--depth=0', '--json'];
      const { stdout } = execa.sync('npm', args);
      if (stdout) {
        const { dependencies = {} } = JSON.parse(stdout);
        const depNames = Object.keys(dependencies).filter((dep: string) => (dep !== 'npm' && dep !== 'tnpm')) || [];

        depNames.forEach((dep: string) => {
          const { version: depVersion } = dependencies[dep];
          this.globalNpmPackages.push(`${dep}@${depVersion}`);
        });
      }
    }
    const formattedVersion = formatNodeVersion(version);
    const shFilePath = path.resolve(__dirname, '../data/shells', 'nvm-install-node.sh');

    return new Promise((resolve, reject) => {
      const args: string[] = [shFilePath, formattedVersion];
      const cp = execa('sh', args);

      cp.stdout.on('data', this.listenFunc);

      cp.stderr.on('data', this.listenFunc);

      cp.on('error', (buffer: Buffer) => {
        this.listenFunc(buffer);
        log.error(buffer.toString());
        reject(buffer.toString());
      });

      cp.on('exit', () => {
        this.nodePath = this.getCurrentNodePath(this.std);
        const npmVersion = this.getCurrentNpmVersion(this.std);

        resolve({ nodeVersion: formattedVersion, npmVersion });
      });
    });
  };

  async getNodeVersionsList() {
    const shFilePath = formatWhitespaceInPath(path.resolve(__dirname, '../data/shells', 'nvm-node-version.sh'));
    const { stdout } = await execa.command(`sh ${shFilePath}`);

    return stdout
      .split('\n')
      .reverse()
      .map((version: string) => stripAnsi(version).trim());
  }

  reinstallPackages = () => {
    return new Promise((resolve, reject) => {
      const args = ['i', '-g', ...this.globalNpmPackages, '--registry', 'https://registry.npm.taobao.org'];

      const cp = execa('npm', args, {
        // specify execPath to the node path which installed just now
        execPath: this.nodePath,
        preferLocal: true,
        // Don't extend env because it will not use the current(new) npm to install package
        extendEnv: false,
      });

      cp.stdout.on('data', this.listenFunc);

      cp.stderr.on('data', this.listenFunc);

      cp.on('error', (buffer: Buffer) => {
        this.listenFunc(buffer);
        log.error(buffer.toString());
        reject(buffer.toString());
      });

      cp.on('exit', () => {
        resolve(null);
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
