import executeCommandJSON from '../../utils/executeCommandJSON';
import log from '../../utils/log';

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

export async function getGlobalDependencies() {
  const { dependencies: installedDeps } = await executeCommandJSON<InstalledDependencies>('npm', ['list', '-g', '--depth=0', '--json']);
  const outdatedDeps = await executeCommandJSON('npm', ['outdated', '-g', '--json']);

  const depsInfo = Object.keys(installedDeps).map((name: string) => {
    return {
      name,
      type: 'global',
      currentVersion: getCurrentVersion(installedDeps[name]),
      latestVersion: getLatestVersion(outdatedDeps[name]),
    };
  });
  log.info('depsInfo:', depsInfo);
  return depsInfo;
}

function getCurrentVersion(installedDependency: InstalledDependency) {
  return installedDependency.version;
}

function getLatestVersion(outdatedDependency?: OutdatedDependency) {
  return !outdatedDependency ? '' : outdatedDependency.latest;
}
