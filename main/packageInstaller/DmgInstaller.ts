import * as path from 'path';
import { Mounter } from '@shockpkg/hdi-mac';
import * as globby from 'globby';
import * as fse from 'fs-extra';
import * as sudo from 'sudo-prompt';
import { APPLICATIONS_DIR_PATH } from '../constants';
import writeLog from '../utils/writeLog';
import formatWhitespaceInPath from '../utils/formatWhitespaceInPath';
import { IPackageInstaller, IPackageInfo } from '../types';

class DmgInstaller implements IPackageInstaller {
  channel: string;

  dmgProcessor: { [k: string]: Function };

  constructor(channel: string) {
    this.channel = channel;
    this.dmgProcessor = {
      '.app': this.installApp,
      '.pkg': this.installPkg,
    };
  }

  async install(packageInfo: IPackageInfo, dmgPath: string) {
    const { name } = packageInfo;
    // mount app to the disk
    const mounter = new Mounter();
    const { devices, eject } = await mounter.attach(dmgPath);
    const mountDevice = devices.find((device) => {
      return device.mountPoint;
    });
    if (!mountDevice) {
      const errMsg = `no mountPoint was found in ${devices}`;
      writeLog(this.channel, errMsg);
      throw new Error(errMsg);
    }

    const { mountPoint } = mountDevice;
    const regPkgType = Object.keys(this.dmgProcessor).map((key) => `*${key}`);
    const appNames = globby.sync(regPkgType, { onlyFiles: false, deep: 1, cwd: mountPoint });

    const ret = { name, localPath: null };

    // install app
    for (const appName of appNames) {
      const sourcePath = path.join(mountPoint, appName);
      const extname = path.extname(appName);
      const installFunc = this.dmgProcessor[extname];
      if (installFunc) {
        const localPath = await installFunc({ sourcePath, appName, name });
        ret.localPath = localPath;
      }
    }
    // eject app from disk
    await eject();

    return ret;
  }

  installApp = async ({ sourcePath, appName }) => {
    const dest = path.join(APPLICATIONS_DIR_PATH, appName);
    // copy xxx.app to `/Applications` dir
    await fse.copy(sourcePath, dest, { overwrite: true });
    const chunk = `Copy ${sourcePath} to ${dest} successfully.`;
    writeLog(this.channel, chunk);
    return dest;
  };

  installPkg = async ({ sourcePath, name }) => {
    const modifiedSource = formatWhitespaceInPath(sourcePath);
    const options = { name: 'Appworks Toolkit' };

    return new Promise((resolve, reject) => {
      sudo.exec(
        `installer -pkg ${modifiedSource} -target ${APPLICATIONS_DIR_PATH}`,
        options,
        (error, stdout, stderr) => {
          if (error) {
            const errMsg = error.message;
            writeLog(this.channel, errMsg);
            reject(errMsg);
          }
          if (stderr) {
            const errMsg = stderr.toString();
            writeLog(this.channel, errMsg);
            reject(errMsg);
          }
          if (stdout) {
            writeLog(this.channel, stdout.toString());
            resolve(path.join('/usr/local', name));
          }
        },
      );
    });
  };
}

export default DmgInstaller;
