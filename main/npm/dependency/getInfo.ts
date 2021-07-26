import packageJSON, { AbbreviatedMetadata } from 'package-json';
import getNpmRegistry from '../../utils/getNpmRegistry';
import getVersionStatus from '../../utils/getVersionStatus';
import executeCommandJSON from '../../utils/executeCommandJSON';
import log from '../../utils/log';
import nodeCache from '../../utils/nodeCache';

interface InstalledDependency {
  version: string;
  from?: string;
  resolved?: string;
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
    // exclude the dependency which the version is null and the ignore dependencies
    const deps = Object.keys(installedDeps)
      .filter((name: string) => !IGNORE_DEPENDENCIES.includes(name) && installedDeps[name].version);

    const depsInfo = [];
    for (const dep of deps) {
      let latestVersion = '';
      try {
        latestVersion = await getLatestVersion(dep);
      } catch (err) {
        log.error(err);
      }
      const currentVersion = getCurrentVersion(installedDeps[dep]);

      depsInfo.push({
        name: dep,
        type: 'global',
        currentVersion,
        latestVersion,
        isOutdated: getVersionStatus(currentVersion, latestVersion) === 'upgradeable',
      });
    }

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
interface PackageJSON extends AbbreviatedMetadata {
  version: string;
}

async function getLatestVersion(name: string) {
  const registryUrl = await getNpmRegistry();
  const { version: latest } = await packageJSON(
    name,
    { registryUrl },
  ) as PackageJSON;

  return latest;
}
