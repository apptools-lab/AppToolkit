import * as ini from 'ini';
import * as fse from 'fs-extra';
import { NPMRC_PATH } from '../constants';

export async function getNpmInfo() {
  const npmrcExists = await fse.pathExists(NPMRC_PATH);
  const npmrc = npmrcExists ? ini.parse(fse.readFileSync(NPMRC_PATH, 'utf-8')) : {};
  return npmrc;
}

export async function setNpmInfo(npmrc: object) {
  await fse.writeFile(NPMRC_PATH, ini.stringify(npmrc));
}
