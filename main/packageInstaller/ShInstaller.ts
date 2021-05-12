import * as execa from 'execa';
import executeBashConfigFile from '../utils/executeBashConfigFile';
import { IPackageInfo } from '../types';
import log from '../utils/log';

class ShInstaller {
  channel: string;
  shProcessor: {[k: string]: Function };
  nodeProcessor: {[k: string]: Function };

  constructor(channel: string) {
    this.channel = channel;
    this.shProcessor = {
      node: this.installNode,
    };

    this.nodeProcessor = {
      nvm: this.installNvm,
    };
  }

  install = async (shPath: string, packageInfo: IPackageInfo) => {
    const { name } = packageInfo;
    const installFunc = this.shProcessor[name];
    if (installFunc) {
      await installFunc({ shPath, packageInfo });
    }
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
    return new Promise((resolve, reject) => {
      let installStdout = '';
      const listenFunc = (buffer: Buffer) => {
        const chunk = buffer.toString();
        installStdout += chunk;
        process.send({ channel: this.channel, data: { chunk, ln: false } });
      };

      const cp = execa('sh', [shPath]);

      cp.stdout.on('data', listenFunc);

      cp.stderr.on('data', listenFunc);

      cp.on('error', (buffer: Buffer) => {
        listenFunc(buffer);
        log.error(buffer.toString());
        reject(buffer.toString());
      });

      cp.on('exit', (code) => {
        log.error(installStdout);
        const matchRes = installStdout.match(/^(?:=> Appending nvm source string to|=> nvm source string already in) (.*)/);
        if (matchRes) {
          const nvmBashProfilePath = matchRes[1];
          executeBashConfigFile(nvmBashProfilePath);
        }
        resolve(code);
      });
    });
  };
}

export default ShInstaller;
