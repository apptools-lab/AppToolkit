import { Mounter } from '@shockpkg/hdi-mac';
import * as globby from 'globby';
import * as fse from 'fs-extra';
import writeLog from './writeLog';
import * as path from 'path';
import * as sudo from 'sudo-prompt';
import { APPLICATIONS_DIR_PATH } from '../constants';

class DmgInstaller {
  channel: string;

  dmgProcessor: {[k: string]: Function};

  constructor(channel: string) {
    this.channel = channel;
    this.dmgProcessor = {
      '.app': this.installApp,
      '.pkg': this.installPkg,
    };
  }

  async install(dmgPath: string) {
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
    // install app
    for (const appName of appNames) {
      const sourcePath = path.join(mountPoint, appName);
      const extname = path.extname(appName);
      const installFunc = this.dmgProcessor[extname];
      if (installFunc) {
        await installFunc({ sourcePath, appName });
      }
    }
    // eject app from disk
    await eject();
  }

  installApp = async ({ sourcePath, appName }) => {
    const dest = path.join(APPLICATIONS_DIR_PATH, appName);
    // copy xxx.app to `/Applications` dir
    await fse.copy(sourcePath, dest, { overwrite: true });
    const chunk = `Copy ${sourcePath} to ${dest} successfully.`;
    writeLog(this.channel, chunk);
  };

  installPkg = async ({ sourcePath }) => {
    const modifiedSource = sourcePath.replace(/ /g, '\\ ');
    const options = { name: 'Appworks Toolkit' };

    return new Promise((resolve, reject) => {
      sudo.exec(
        `installer -pkg ${modifiedSource} -target ${APPLICATIONS_DIR_PATH}`,
        options,
        (error, stdout, stderr) => {
          if (error) {
            writeLog(this.channel, error.message);
            reject(error);
          }
          if (stderr) {
            writeLog(this.channel, stderr.toString());
            reject(stderr);
          }
          if (stdout) {
            writeLog(this.channel, stdout.toString());
            resolve(stdout);
          }
        },
      );
    });
  };
}

export default DmgInstaller;
