import packageJSON, { AbbreviatedMetadata } from 'package-json';
import executeCommandJSON from '../../utils/executeCommandJSON';
import log from '../../utils/log';
import nodeCache from '../../utils/nodeCache';
import { getCurrentRegistry } from '../registry';

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
      const latestVersion = await getLatestVersion(dep);
      const currentVersion = getCurrentVersion(installedDeps[dep]);

      depsInfo.push({
        name: dep,
        type: 'global',
        currentVersion,
        latestVersion,
        isOutdated: latestVersion !== currentVersion,
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
  const registryUrl = await getCurrentRegistry();
  const { version: latest } = await packageJSON(
    name,
    { registryUrl },
  ) as PackageJSON;

  return latest;
}
