import { Mounter } from '@shockpkg/hdi-mac';
import * as fse from 'fs-extra';
import * as globby from 'globby';
import * as path from 'path';
import { APPLICATION_PATH } from '../constants';

async function installDmg() {
  const mounter = new Mounter();
  const { devices, eject } = await mounter.attach('/Users/luhc228/Downloads/Yuque-0.7.14.dmg');
  const { mountPoint } = devices[1];
  const paths = await globby.sync('*.app', { onlyFiles: false, deep: 1, cwd: mountPoint });
  if (paths.length) {
    const appName = paths[0];
    fse.copySync(path.join(mountPoint, appName), path.join(APPLICATION_PATH, appName));
  }
  await eject();
}

export default installDmg;
