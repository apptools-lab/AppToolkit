import log from '../../utils/log';
import { installGlobalDependency } from './install';
import { uninstallGlobalDependency } from './uninstall';

export async function reinstallGlobalDependency(dependency: string, version: string) {
  if (!dependency) {
    const errMsg = 'No Dependency was passed.';
    log.error(errMsg);
    throw new Error(errMsg);
  }

  try {
    await uninstallGlobalDependency(dependency);
    await installGlobalDependency(dependency, version);
  } catch (err) {
    log.error(err.message);
    throw new Error(err.message);
  }
}
