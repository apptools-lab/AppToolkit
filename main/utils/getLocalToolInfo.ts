import * as execa from 'execa';
import { ILocalPackageInfo } from '../types';
import getVersionStatus from './getVersionStatus';

function getLocalToolInfo(name: string, latestVersion: string | null) {
  const localToolInfo: ILocalPackageInfo = {
    localVersion: null,
    localPath: null,
    installStatus: 'notInstalled',
  };

  let toolRes;
  try {
    toolRes = execa.sync('which', [name]);
  } catch {
    console.error(`[appworks-toolkit] Tool ${name} is not found.`);
    return localToolInfo;
  }
  localToolInfo.localPath = toolRes.stdout;

  let toolVersionRes;
  try {
    toolVersionRes = execa.sync(name, ['--version'], { shell: true });
  } catch {
    console.error(`[appworks-toolkit] Tool ${name} version is not found.`);
  }

  if (toolVersionRes) {
    const versionStr = toolVersionRes.stdout;
    const versionStrMatch = versionStr.match(/(\d+(\.\d+)*)/);
    localToolInfo.localVersion = versionStrMatch ? versionStrMatch[1] : versionStr;
  }
  localToolInfo.installStatus = getVersionStatus(localToolInfo.localVersion, latestVersion);

  return localToolInfo;
}

export default getLocalToolInfo;
