import * as path from 'path';
import * as execa from 'execa';
import checkCommandInstalled from '../utils/checkCommandInstalled';
import { PackageInfo, IPackageManager, PackagesData, Platform } from '../types';
import { INSTALL_COMMAND_PACKAGES, VSCODE_COMMAND_NAME, VSCODE_NAME } from '../constants';
import writeLog from '../utils/writeLog';
import getLocalDmgInfo from '../packageInfo/dmg';
import installCommandToPath from '../utils/installCommandToPath';

class IDEExtensionManager implements IPackageManager {
  channel: string;

  packagesData: PackagesData;

  IDETypeProcessor: { [k: string]: Function };

  constructor(channel: string, packagesData: any) {
    this.channel = channel;

    this.packagesData = packagesData;

    this.IDETypeProcessor = {
      VSCode: this.installVSCodeExtension,
    };
  }

  install = async (packageInfo: PackageInfo) => {
    const { id, options: { IDEType } } = packageInfo;
    const ret = { id };
    const installFunc = this.IDETypeProcessor[IDEType];
    if (installFunc) {
      await installFunc(id);
    }
    return ret;
  };

  private installVSCodeExtension = async (extensionId: string) => {
    await this.ensureVSCodeCommandInstalled();

    return new Promise((resolve, reject) => {
      const listenFunc = (buffer: Buffer) => {
        writeLog(this.channel, buffer.toString(), false);
      };

      const cp = execa(VSCODE_COMMAND_NAME, ['--install-extension', extensionId]);

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
    });
  };

  private ensureVSCodeCommandInstalled = async () => {
    if (!checkCommandInstalled(VSCODE_COMMAND_NAME)) {
      writeLog(this.channel, `VS Code command '${VSCODE_COMMAND_NAME}' was not installed.`, true, 'error');

      // try to install code command to the path
      writeLog(this.channel, 'Try to install code command to path.', true, 'info');

      const { bases = [] } = this.packagesData;

      const vscodeInfo = bases.find((base) => base.id === VSCODE_NAME && base.platforms.includes(process.platform as Platform));
      if (!vscodeInfo) {
        throw new Error(`${VSCODE_NAME} info was not found.`);
      }

      const appType = vscodeInfo.type;
      let vscodeLocalInfo;
      switch (appType) {
        case 'dmg':
          vscodeLocalInfo = await getLocalDmgInfo(vscodeInfo);
          break;
        default:
          throw new Error(`The app type ${appType} of ${VSCODE_NAME} was not found.`);
      }

      if (vscodeLocalInfo.versionStatus === 'uninstalled') {
        throw new Error(`${VSCODE_NAME} was not installed.`);
      }

      const { path: localPath } = vscodeLocalInfo;
      const vscodeCommand = INSTALL_COMMAND_PACKAGES.find((pkg) => pkg.name === VSCODE_NAME);
      if (vscodeCommand) {
        const { commandRelativePath } = vscodeCommand;
        const source = path.join(localPath, commandRelativePath);
        await installCommandToPath(source, VSCODE_COMMAND_NAME);
        writeLog(this.channel, `Install ${VSCODE_COMMAND_NAME} command to path successfully.`, true, 'info');
      }
    }
  };
}

export default IDEExtensionManager;
