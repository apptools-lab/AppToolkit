import executeCommandJSON from '../../utils/executeCommandJSON';
import log from '../../utils/log';
import nodeCache from '../../utils/nodeCache';

interface InstalledDependency {
  version: string;
  from?: string;
  resolved?: string;
}

interface OutdatedDependency {
  current: string;
  wanted: string;
  latest: string;
  location: string;
}

interface InstalledDependencies {
  dependencies: {[key: string]: InstalledDependency};
}

const GLOBAL_DEPS_KEY = 'globalDependencies';
const IGNORE_DEPENDENCIES = ['npm'];

export async function getGlobalDependencies(force: boolean) {
  try {
    const cache = nodeCache.get(GLOBAL_DEPS_KEY);
    if (!force && cache) {
      return cache;
    }
    const { dependencies: installedDeps } = await executeCommandJSON<InstalledDependencies>('npm', ['list', '-g', '--depth=0', '--json']);
    const outdatedDeps = await executeCommandJSON('npm', ['outdated', '-g', '--json']);

    const depsInfo = Object.keys(installedDeps)
      .filter((name: string) => !IGNORE_DEPENDENCIES.includes(name) && installedDeps[name].version)
      .map((name: string) => {
        return {
          name,
          type: 'global',
          currentVersion: getCurrentVersion(installedDeps[name]),
          latestVersion: getLatestVersion(outdatedDeps[name]),
        };
      });
    log.info('depsInfo: ', depsInfo);
    nodeCache.set(GLOBAL_DEPS_KEY, depsInfo);
    return depsInfo;
  } catch (error) {
    log.error(error.message);
    throw error;
  }
}

function getCurrentVersion(installedDependency: InstalledDependency) {
  return installedDependency.version;
}

function getLatestVersion(outdatedDependency?: OutdatedDependency) {
  return !outdatedDependency ? '' : outdatedDependency.latest;
}
