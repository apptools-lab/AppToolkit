import * as execa from 'execa';
import isCliInstalled from '../utils/isCliInstalled';
import { IPackageInfo, IPackageInstaller } from '../types';
import { VSCODE_CLI_COMAMND_NAME } from '../constants';
import writeLog from '../utils/writeLog';

class IDEExtensionInstaller implements IPackageInstaller {
  channel: string;

  IDETypeProcessor: { [k: string]: Function };

  constructor(channel: string) {
    this.channel = channel;

    this.IDETypeProcessor = {
      VSCode: this.installVSCodeExtension,
    };
  }

  install = async (packageInfo: IPackageInfo) => {
    const { name, options: { IDEType } } = packageInfo;
    // TODO: get the local path of IDE extension
    const ret = { name, localPath: null };
    const installFunc = this.IDETypeProcessor[IDEType];
    if (installFunc) {
      await installFunc(name);
    }
    return ret;
  };

  private installVSCodeExtension = (extensionId: string) => {
    return new Promise((resolve, reject) => {
      if (!isCliInstalled(VSCODE_CLI_COMAMND_NAME)) {
        const errMsg = `IDE Extension Installer: VS Code command '${VSCODE_CLI_COMAMND_NAME}' was not installed.`;
        writeLog(this.channel, errMsg, true, 'error');
        reject(errMsg);
      } else {
        const listenFunc = (buffer: Buffer) => {
          writeLog(this.channel, buffer.toString(), false);
        };

        const cp = execa(VSCODE_CLI_COMAMND_NAME, ['--install-extension', extensionId]);

        cp.stdout.on('data', listenFunc);

        cp.stderr.on('data', listenFunc);

        cp.on('error', (buffer: Buffer) => {
          const chunk = buffer.toString();
          writeLog(this.channel, chunk, true, 'error');
          reject(chunk);
        });

        cp.on('exit', (code) => {
          resolve(code);
        });
      }
    });
  };
}

export default IDEExtensionInstaller;
