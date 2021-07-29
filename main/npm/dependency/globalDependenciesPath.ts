import * as path from 'path';
import * as execa from 'execa';
import { HOME_DIR } from '../../constants';
import { getNpmInfo } from '../npmInfo';

const GLOBAL_DEPENDENCIES_DIR = 'npm_global';
export const GLOBAL_DEPENDENCIES_PATH = path.join(HOME_DIR, GLOBAL_DEPENDENCIES_DIR);

export async function getGlobalDependenciesInfo() {
  let prefix;
  // first get from the .npmrc
  const npmInfo = await getNpmInfo();
  prefix = npmInfo.prefix;
  if (!npmInfo.prefix) {
    // if prefix was not found in .npmrc, run the npm config command
    const { stdout } = await execa('npm', ['config', 'get', 'prefix']);
    prefix = stdout;
  }
  return {
    recommendedPath: GLOBAL_DEPENDENCIES_PATH,
    currentPath: prefix,
    exists: prefix === GLOBAL_DEPENDENCIES_PATH,
  };
}
