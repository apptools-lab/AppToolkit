import * as path from 'path';
import * as execa from 'execa';
import { HOME_DIR } from '../../constants';

const GLOBAL_DEPENDENCIES_DIR = 'npm_global';
export const GLOBAL_DEPENDENCIES_PATH = path.join(HOME_DIR, GLOBAL_DEPENDENCIES_DIR);

export async function getGlobalDependenciesInfo() {
  const { stdout: prefix } = await execa('npm', ['config', 'get', 'prefix']);
  return {
    recommendedPath: GLOBAL_DEPENDENCIES_PATH,
    currentPath: prefix,
    exists: prefix === GLOBAL_DEPENDENCIES_PATH,
  };
}
