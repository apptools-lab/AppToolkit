import * as shell from 'shelljs';
import * as globby from 'globby';
import { IBasicPackageInfo } from 'types';
import { APPLICATIONS_DIR_PATH } from '../constants';
import getVersionStatus from '../utils/getVersionStatus';

function getLocalDmgInfo(basicPackageInfo: IBasicPackageInfo) {
  const { name, version: latestVersion } = basicPackageInfo;
  const app = /\.app$/.test(name) ? name : `${name}.app`;
  const appInfo = {
    version: null,
    path: null,
    versionStatus: 'uninstalled',
  };

  const paths = globby.sync([app], {
    cwd: APPLICATIONS_DIR_PATH,
    onlyDirectories: true,
    deep: 1,
  });

  if (!paths.length) {
    return appInfo;
  }

  const appPath = `${APPLICATIONS_DIR_PATH}/${app}`;
  appInfo.path = appPath;

  const info = shell.cat(`${appPath}/Contents/Info.plist`);
  const infoStr = info.stdout;

  const versionMatchRes = infoStr.match(/<key>CFBundleShortVersionString<\/key>[\r\n\s]*<string>(\d+(\.\d+)*).*<\/string>/);
  if (versionMatchRes) {
    appInfo.version = versionMatchRes[1];
  }

  appInfo.versionStatus = getVersionStatus(appInfo.version, latestVersion);

  return appInfo;
}

export default getLocalDmgInfo;
