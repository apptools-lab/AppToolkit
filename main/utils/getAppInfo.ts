import * as shell from 'shelljs';
import * as globby from 'globby';
import { APPLICATION_PATH } from '../constants';

function findApp(appName: string) {
  const app = /\.app$/.test(appName) ? appName : `${appName }.app`;
  const appInfo = {
    version: null,
    path: null,
  };

  const paths = globby.sync([app], {
    cwd: APPLICATION_PATH,
    onlyDirectories: true,
    deep: 1,
  });

  if (!paths.length) {
    return appInfo;
  }

  appInfo.path = `${APPLICATION_PATH}/${app}`;

  const info = shell.cat(`${APPLICATION_PATH}/${app}/Contents/Info.plist`);
  const infoStr = info.stdout;

  const versionMatchRes = infoStr.match(/<key>CFBundleShortVersionString<\/key>[\r\n\s]*<string>(\d+(\.\d+)*)<\/string>/);
  if (versionMatchRes && versionMatchRes.length > 1) {
    appInfo.version = versionMatchRes[1];
  }

  return appInfo;
}

export default findApp;
