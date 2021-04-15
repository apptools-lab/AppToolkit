import * as execa from 'execa';
import getVersionStatus from './getVersionStatus';

function findTool(toolName: string, latestVersion: string) {
  const toolInfo = {
    version: null,
    path: null,
    installStatus: null,
  };

  const toolRes = execa.sync('which', [toolName]);
  if (!toolRes) {
    return toolInfo;
  }

  toolInfo.path = toolRes.stdout;
  const toolVersionRes = execa.sync(toolName, ['--version']);

  if (toolVersionRes) {
    const versionStr = toolVersionRes.stdout;
    const versionStrMatch = versionStr.match(/(\d+(\.\d+)*)/);
    toolInfo.version = versionStrMatch && versionStrMatch.length > 1 ? versionStrMatch[1] : versionStr;
  }

  toolInfo.installStatus = getVersionStatus(toolInfo.version, latestVersion);

  return toolInfo;
}

export default findTool;
