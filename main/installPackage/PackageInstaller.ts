import * as path from 'path';
import { IPackageInfo } from '../types';
import DmgInstaller from './DmgInstaller';
import ShInstaller from './ShInstaller';
import ZipInstaller from './ZipInstaller';

class PackageInstaller {
  packageProcessor = {
    '.sh': ShInstaller,
    '.zip': ZipInstaller,
    '.dmg': DmgInstaller,
  };

  channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  install = async (packagePath: string, packageInfo: IPackageInfo) => {
    const extname = path.extname(packagePath);
    const Installer = this.packageProcessor[extname];
    const installer = new Installer(this.channel);
    await installer.install(packagePath, packageInfo);
  };
}

export default PackageInstaller;
