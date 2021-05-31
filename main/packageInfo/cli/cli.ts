import * as execa from 'execa';
import * as shell from 'shelljs';
import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import getVersionStatus from '../../utils/getVersionStatus';
import log from '../../utils/log';

function getLocalCliInfo(name: string, latestVersion: string | null) {
  const localCliInfo = { ...DEFAULT_LOCAL_PACKAGE_INFO };
  // get the local path of cli
  try {
    const { stdout: cliPath } = shell.which(name);

    if (!cliPath) {
      throw new Error(`Command ${name} is not found.`);
    }
    localCliInfo.localPath = cliPath;
  } catch (error) {
    log.error(error.message);
    return localCliInfo;
  }
  // get cli version
  try {
    const { stdout: cliVersion } = execa.sync(
      localCliInfo.localPath,
      ['--version'],
      { shell: true },
    );
    const cliVersionMatch = cliVersion.match(/(\d+(\.\d+)*)/);
    localCliInfo.localVersion = cliVersionMatch ? cliVersionMatch[1] : cliVersion;
  } catch (error) {
    log.error(`Tool ${name} version is not found. Error: ${error.message}`);
  }
  // get cli version status
  localCliInfo.versionStatus = getVersionStatus(localCliInfo.localVersion, latestVersion);

  return localCliInfo;
}

export default getLocalCliInfo;
