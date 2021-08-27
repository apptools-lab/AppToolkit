import * as execa from 'execa';
import { IPackageManager, PackageInfo } from '../types';
import writeLog from '../utils/writeLog';
import getNpmRegistry from '../utils/getNpmRegistry';
import log from '../utils/log';

class NpmDependencyManager implements IPackageManager {
  channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  async install(packageInfo: PackageInfo): Promise<{id: string}> {
    const { id: dependency, version } = packageInfo;

    const npmRegistry = await getNpmRegistry();
    const command = `npm install ${dependency}@${version || 'latest'} -g --registry=${npmRegistry}`;

    return new Promise((resolve, reject) => {
      let installStdout = '';

      const listenFunc = (buffer: Buffer) => {
        const chunk = buffer.toString();
        installStdout += chunk;
        process.send({ channel: this.channel, data: { chunk, ln: false } });
      };

      const cp = execa.command(command);

      cp.stdout.on('data', listenFunc);

      cp.stderr.on('data', listenFunc);

      cp.on('error', (buffer: Buffer) => {
        const chunk = buffer.toString();
        writeLog(this.channel, chunk, true, 'error');
        reject(chunk);
      });

      cp.on('exit', () => {
        log.info(installStdout);

        resolve({ id: dependency });
      });
    });
  }
}

export default NpmDependencyManager;
