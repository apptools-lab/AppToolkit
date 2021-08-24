import * as execa from 'execa';
import executeProfile from '../utils/executeProfile';
import { PackageInfo, IPackageManager } from '../types';
import log from '../utils/log';
import ensureProfileExists from '../utils/ensureProfileExists';
import writeLog from '../utils/writeLog';
import getShellName from '../utils/getShellName';

class CliManager implements IPackageManager {
  channel: string;

  cliProcessor: { [k: string]: Function };

  nodeProcessor: { [k: string]: Function };

  constructor(channel: string) {
    this.channel = channel;
    this.cliProcessor = {
      node: this.installNode,
    };

    this.nodeProcessor = {
      nvm: this.installNvm,
    };
  }

  install = async (packageInfo: PackageInfo, shPath: string) => {
    const { name } = packageInfo;
    const installFunc = this.cliProcessor[name];
    if (installFunc) {
      await installFunc({ shPath, packageInfo });
    }

    return { name };
  };

  private installNode = async ({ shPath, packageInfo }) => {
    const { options } = packageInfo;
    const { managerName } = options;
    const installManagerFunc = this.nodeProcessor[managerName];
    if (installManagerFunc) {
      await installManagerFunc({ shPath });
    }
  };

  private installNvm = ({ shPath }) => {
    ensureProfileExists();

    return new Promise((resolve, reject) => {
      let installStdout = '';
      const listenFunc = (buffer: Buffer) => {
        const chunk = buffer.toString();
        installStdout += chunk;
        process.send({ channel: this.channel, data: { chunk, ln: false } });
      };

      const cp = execa(getShellName(), [shPath]);

      cp.stdout.on('data', listenFunc);

      cp.stderr.on('data', listenFunc);

      cp.on('error', (buffer: Buffer) => {
        const chunk = buffer.toString();
        writeLog(this.channel, chunk, true, 'error');
        reject(chunk);
      });

      cp.on('exit', () => {
        log.info(installStdout);
        const nvmProfileMatchRes = installStdout.match(/(?:=> Appending nvm source string to|=> nvm source string already in) (.*)/);
        if (nvmProfileMatchRes) {
          const nvmProfilePath = nvmProfileMatchRes[1];
          // ensure nvm envs are in current shell environment
          executeProfile(nvmProfilePath);
        }
        resolve(null);
      });
    });
  };
}

export default CliManager;
