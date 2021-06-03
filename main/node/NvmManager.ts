import * as path from 'path';
import * as execa from 'execa';
import * as shell from 'shelljs';
import { INodeManager } from '../types';
import log from '../utils/log';
import formatNodeVersion from '../utils/formatNodeVersion';
import { NOT_REINSTALL_PACKAGES } from '../constants';
import getNpmRegistry from '../utils/getNpmRegistry';

class NvmManager implements INodeManager {
  channel: string;

  std: string;

  previousNpmPath: string;

  globalNpmPackages: string[];

  nodePath: string;

  constructor(channel = '') {
    this.channel = channel;
    this.std = '';
    this.previousNpmPath = '';
    this.globalNpmPackages = [];
    this.nodePath = '';
  }

  installNode = (version: string, reinstallGlobalDeps = true) => {
    if (reinstallGlobalDeps) {
      // get the previous npm path
      const { stdout } = shell.which('npm');
      this.previousNpmPath = stdout;
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
        const nodePath = this.getCurrentNodePath(this.std);
        const npmVersion = this.getCurrentNpmVersion(this.std);
        this.nodePath = nodePath;
        resolve({ nodeVersion: formattedVersion, npmVersion, nodePath });
      });
    });
  };

  reinstallPackages = () => {
    return this.getGlobalNpmPackages()
      .then(() => getNpmRegistry())
      .then((npmRegistry) => {
        return new Promise((resolve, reject) => {
          const args = ['i', '-g', ...this.globalNpmPackages, '--registry', npmRegistry];
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

  private async getGlobalNpmPackages() {
    if (!this.previousNpmPath) {
      throw new Error('Npm command was not Found.');
    }
    const { stdout } = await execa(this.previousNpmPath, ['list', '-g', '--depth=0', '--json']);
    if (stdout) {
      const { dependencies = {} } = JSON.parse(stdout);
      const depNames = Object.keys(dependencies).filter((dep: string) => !NOT_REINSTALL_PACKAGES.includes(dep)) || [];

      depNames.forEach((dep: string) => {
        const { version: depVersion } = dependencies[dep];
        this.globalNpmPackages.push(`${dep}@${depVersion}`);
      });
    }
  }
}

export default NvmManager;
