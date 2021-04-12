import * as shell from 'shelljs';

function findTool(toolName: string) {
  const toolInfo = {
    version: null,
    path: null,
  };
  const toolRes = shell.which(toolName);
  if (!toolRes) {
    return toolInfo;
  }
  // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
  toolInfo.path = toolRes.toString();
  const toolVersion = shell.exec(`${toolName} --version`);
  if (toolVersion) {
    // eslint-disable-next-line @iceworks/best-practices/recommend-polyfill
    const versionStr = toolVersion.toString();
    const versionStrMatch = versionStr.match(/(\d+(\.\d+)*)/);
    if (versionStrMatch && versionStrMatch.length > 1) {
      toolInfo.version = versionStrMatch[1];
    } else {
      toolInfo.version = versionStr;
    }
  }

  return toolInfo;
}

export default findTool;
