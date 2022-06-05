import * as path from 'path';
import fse from 'fs-extra';
import consola from 'consola';
import * as sudo from 'sudo-prompt';
import { globby } from 'globby';
import { Mounter } from '@shockpkg/hdi-mac';
import PackageManager from './PackageManager';
import { MAC_APPS_DIR_PATH } from '@/constants';
import formatWhitespaceInPath from '@/utils/formatWhitespaceInPath';

interface InstallDmgPackageFunc {
  ({ sourcePath, appName, id }: { sourcePath: string; appName: string; id: string }): Promise<string>;
}

export default class DmgPackageManager extends PackageManager {
  dmgProcessor: { [k: string]: Function };
  constructor() {
    super();
    this.dmgProcessor = {
      '.app': this.installApp,
      '.pkg': this.installPkg,
    };
  }
  async install(id: string, localPackagePath: string) {
    // mount app to the disk
    const mounter = new Mounter();
    const { devices, eject } = await mounter.attach(localPackagePath);
    const mountDevice = devices.find((device) => {
      return device.mountPoint;
    });
    if (!mountDevice?.mountPoint) {
      const errMsg = `no mountPoint was found in ${devices}`;
      throw new Error(errMsg);
    }

    const { mountPoint } = mountDevice;
    const regPkgType = Object.keys(this.dmgProcessor).map((key) => `*${key}`);
    const appNames = await globby(regPkgType, { onlyFiles: false, deep: 1, cwd: mountPoint });

    // install app
    for (const appName of appNames) {
      const sourcePath = path.join(mountPoint, appName);
      const extname = path.extname(appName);
      const installFunc = this.dmgProcessor[extname];
      if (installFunc) {
        await installFunc({ sourcePath, appName, id });
      }
    }
    // eject app from disk
    await eject();

    return {
      success: true,
      message: '',
      id,
    };
  }

  async uninstall(id: string) {
    return {
      success: true,
      message: '',
    };
  }

  private installApp: InstallDmgPackageFunc = async ({ sourcePath, appName }) => {
    const dest = path.join(MAC_APPS_DIR_PATH, appName);
    // copy xxx.app to `/Applications` dir
    await fse.copy(sourcePath, dest, { overwrite: true });
    const info = `Copy ${sourcePath} to ${dest} successfully.`;
    consola.log(info);
    return dest;
  };

  private installPkg: InstallDmgPackageFunc = async ({ sourcePath, id }) => {
    const modifiedSource = formatWhitespaceInPath(sourcePath);
    const options = { name: 'AppToolkit' };

    return new Promise((resolve, reject) => {
      sudo.exec(
        `installer -pkg ${modifiedSource} -target ${MAC_APPS_DIR_PATH}`,
        options,
        (error, stdout, stderr) => {
          if (error) {
            const errMsg = error.message;
            consola.error(errMsg);
            reject(errMsg);
          }
          if (stderr) {
            const errMsg = stderr.toString();
            consola.error(errMsg);
            reject(errMsg);
          }
          if (stdout) {
            consola.log(stdout.toString());
            resolve(path.join('/usr/local', id));
          }
        },
      );
    });
  };
}