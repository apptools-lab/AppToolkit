import { BasePackageInfo } from 'types';
import executeCommandJSON from '../../utils/executeCommandJSON';
import { InstalledDependencies } from '../../types';
import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';

async function getLocalNpmDependencyInfo(basePackageInfo: BasePackageInfo) {
  const { id: dependencyName } = basePackageInfo;
  const dependencyInfo = { ...DEFAULT_LOCAL_PACKAGE_INFO };

  const { dependencies } = await executeCommandJSON<InstalledDependencies>('npm', ['list', '-g', dependencyName, '--json']);
  if (dependencies && dependencies[dependencyName]) {
    dependencyInfo.versionStatus = 'installed';
    dependencyInfo.localVersion = dependencies[dependencyName].version;
  }

  return dependencyInfo;
}

export default getLocalNpmDependencyInfo;
