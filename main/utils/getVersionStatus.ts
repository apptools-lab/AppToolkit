import * as compareVersions from 'compare-versions';

/**
 * 获取版本的状态
 * 1. notInstalled 未安装
 * 2. installed    已安装
 * 3. upgradeable  可升级
 */
function getVersionStatus(currentVersion: string | null | undefined, latestVersion: string | null) {
  if (!currentVersion) {
    return 'notInstalled';
  } else if (!latestVersion) {
    return 'installed';
  } else {
    return compareVersions.compare(currentVersion, latestVersion, '>=') ? 'installed' : 'upgradeable';
  }
}

export default getVersionStatus;
