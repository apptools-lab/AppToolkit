import * as shell from 'shelljs';
import * as globby from 'globby';
import { BasePackageInfo } from 'types';
import { APPLICATIONS_DIR_PATH, DEFAULT_LOCAL_PACKAGE_INFO } from '../constants';
import getVersionStatus from '../utils/getVersionStatus';

async function getLocalDmgInfo(basePackageInfo: BasePackageInfo) {
  const { name, version: latestVersion } = basePackageInfo;
  const app = /\.app$/.test(name) ? name : `${name}.app`;
  const appInfo = { ...DEFAULT_LOCAL_PACKAGE_INFO };

  const paths = await globby([app], {
    cwd: APPLICATIONS_DIR_PATH,
    onlyDirectories: true,
    deep: 1,
  });

  if (!paths.length) {
    return appInfo;
  }

  const appPath = `${APPLICATIONS_DIR_PATH}/${app}`;
  appInfo.localPath = appPath;

  const info = shell.cat(`${appPath}/Contents/Info.plist`);
  const infoStr = info.stdout;

  const versionMatchRes = infoStr.match(/<key>CFBundleShortVersionString<\/key>[\r\n\s]*<string>(\d+(\.\d+)*).*<\/string>/);
  if (versionMatchRes) {
    appInfo.localVersion = versionMatchRes[1];
  }

  appInfo.versionStatus = getVersionStatus(appInfo.localVersion, latestVersion);

  return appInfo;
}

export default getLocalDmgInfo;
