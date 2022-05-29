import { globby } from 'globby';
import consola from 'consola';
import fse from 'fs-extra';
import { DEFAULT_LOCAL_TOOL_INFO, MAC_APPS_DIR_PATH } from '../constants';
import type { LocalToolInfo, ToolType } from '../../../types';

type GetLocalToolInfo = (toolId: string) => Promise<LocalToolInfo>;

const getLocalMacAppInfo = async (toolId: string) => {
  const app = /\.app$/.test(toolId) ? toolId : `${toolId}.app`;
  const dmgInfo = { ...DEFAULT_LOCAL_TOOL_INFO };

  const paths = await globby([app], {
    cwd: MAC_APPS_DIR_PATH,
    onlyDirectories: true,
    deep: 1,
  });

  if (!paths.length) {
    return dmgInfo;
  }

  const appPath = `${MAC_APPS_DIR_PATH}/${app}`;
  const appInfoPList = `${appPath}/Contents/Info.plist`;
  dmgInfo.localPath = appPath;

  // const info = shell.cat(`${appPath}/Contents/Info.plist`);
  const info = await fse.readFile(appInfoPList, 'utf-8');
  const versionMatchRes = info.match(/<key>CFBundleShortVersionString<\/key>[\r\n\s]*<string>(\d+(\.\d+)*).*<\/string>/);
  if (versionMatchRes) {
    dmgInfo.localVersion = versionMatchRes[1];
  }

  // dmgInfo.versionStatus = getVersionStatus(appInfo.localVersion, latestVersion);

  return dmgInfo;
};

const getLocalCliInfo: GetLocalToolInfo = async (toolId: string) => {
  // TODO:
  return {
    installed: true,
  };
};

const getLocalNpmPackageInfo: GetLocalToolInfo = async (toolId: string) => {
  // TODO:
  return {
    installed: true,
  };
};

const getLocalWindowsAppInfo: GetLocalToolInfo = async (toolId: string) => {
  // TODO:
  return {
    installed: true,
  };
};

const getLocalVSCodeExtensionInfo: GetLocalToolInfo = async (toolId: string) => {
  // TODO:
  return {
    installed: true,
  };
};

const getLocalToolInfoProcessor: Record<ToolType, GetLocalToolInfo> = {
  cli: getLocalCliInfo,
  macApp: getLocalMacAppInfo,
  vscodeExt: getLocalVSCodeExtensionInfo,
  npmPackage: getLocalNpmPackageInfo,
  windowsApp: getLocalWindowsAppInfo,
};

export default async function getLocalToolInfo(toolType: ToolType, toolId: string): Promise<LocalToolInfo> {
  const getLocalToolInfoFunc = (getLocalToolInfoProcessor[toolType]) as GetLocalToolInfo;
  try {
    const localToolInfo = await getLocalToolInfoFunc(toolId);
    return localToolInfo;
  } catch (error) {
    consola.error(error);
    return DEFAULT_LOCAL_TOOL_INFO;
  }
}
