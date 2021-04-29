import * as execa from 'execa';
import * as shell from 'shelljs';
import getVersionStatus from '../../utils/getVersionStatus';
import log from '../../utils/log';
import { ILocalPackageInfo } from '../../types';

function getLocalToolInfo(name: string, latestVersion: string | null) {
  const localToolInfo: ILocalPackageInfo = {
    localVersion: null,
    localPath: null,
    versionStatus: 'notInstalled',
  };
  // get tool local path
  try {
    const toolPath = shell.which(name);
    if (!toolPath) {
      throw new Error(`Tool ${name} is not found.`);
    }
    localToolInfo.localPath = toolPath.stdout;
  } catch (error) {
    log.error(error.message);
    return localToolInfo;
  }
  // get local tool version
  try {
    const toolVersionRes = execa.sync(localToolInfo.localPath, ['--version'], { shell: true });
    const versionStr = toolVersionRes.stdout;
    const versionStrMatch = versionStr.match(/(\d+(\.\d+)*)/);
    localToolInfo.localVersion = versionStrMatch ? versionStrMatch[1] : versionStr;
  } catch (error) {
    log.error(`Tool ${name} version is not found. Error: ${error.message}`);
  }
  // get local tool version status
  localToolInfo.versionStatus = getVersionStatus(localToolInfo.localVersion, latestVersion);

  return localToolInfo;
}

export default getLocalToolInfo;
