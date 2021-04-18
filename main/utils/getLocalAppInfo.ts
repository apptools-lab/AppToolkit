import * as execa from 'execa';
import * as globby from 'globby';
import { APPLICATIONS_DIR_PATH } from '../constants';
import getVersionStatus from './getVersionStatus';

function getLocalAppInfo(name: string, latestVersion: string | null) {
  const app = /\.app$/.test(name) ? name : `${name }.app`;
  const appInfo = {
    version: null,
    path: null,
    installStatus: 'notInstalled',
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

  const info = execa.sync('cat', [`${appPath}/Contents/Info.plist`]);
  const infoStr = info.stdout;

  const versionMatchRes = infoStr.match(/<key>CFBundleShortVersionString<\/key>[\r\n\s]*<string>(\d+(\.\d+)*).*<\/string>/);
  if (versionMatchRes) {
    appInfo.version = versionMatchRes[1];
  }

  appInfo.installStatus = getVersionStatus(appInfo.version, latestVersion);

  return appInfo;
}

export default getLocalAppInfo;
