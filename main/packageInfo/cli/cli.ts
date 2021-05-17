import * as execa from 'execa';
import * as shell from 'shelljs';
import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import getVersionStatus from '../../utils/getVersionStatus';
import log from '../../utils/log';

function getLocalToolInfo(name: string, latestVersion: string | null) {
  const localToolInfo = { ...DEFAULT_LOCAL_PACKAGE_INFO };
  // get the local path of cli
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
  // get cli version
  try {
    const { stdout: cliVersion } = execa.sync(
      localToolInfo.localPath,
      ['--version'],
      { shell: true, extendEnv: false },
    );
    const cliVersionMatch = cliVersion.match(/(\d+(\.\d+)*)/);
    localToolInfo.localVersion = cliVersionMatch ? cliVersionMatch[1] : cliVersion;
  } catch (error) {
    log.error(`Tool ${name} version is not found. Error: ${error.message}`);
  }
  // get cli version status
  localToolInfo.versionStatus = getVersionStatus(localToolInfo.localVersion, latestVersion);

  return localToolInfo;
}

export default getLocalToolInfo;
