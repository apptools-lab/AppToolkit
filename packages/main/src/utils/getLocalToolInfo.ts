import { globby } from 'globby';
import consola from 'consola';
import fse from 'fs-extra';
import { DEFAULT_LOCAL_TOOL_INFO, MAC_APPS_DIR_PATH, VSCODE_CLI_COMMAND_NAME } from '@/constants';
import type { LocalToolInfo, ToolType } from '../../../types';
import which from './which';
import executeCommand from './executeCommand';

type GetLocalToolInfo = (toolId: string) => Promise<LocalToolInfo>;

const getLocalMacAppInfo = async (id: string) => {
  const localMacAppInfo = { ...DEFAULT_LOCAL_TOOL_INFO };
  try {
    // get mac app local path
    const app = /\.app$/.test(id) ? id : `${id}.app`;
    const paths = await globby([app], {
      cwd: MAC_APPS_DIR_PATH,
      onlyDirectories: true,
      deep: 1,
    });
    if (!paths.length) {
      return localMacAppInfo;
    }
    const appPath = `${MAC_APPS_DIR_PATH}/${app}`;
    localMacAppInfo.localPath = appPath;
    localMacAppInfo.installed = true;
    // get mac app local version
    const appInfoPList = `${appPath}/Contents/Info.plist`;
    const info = await fse.readFile(appInfoPList, 'utf-8');
    const versionMatchRes = info.match(/<key>CFBundleShortVersionString<\/key>[\r\n\s]*<string>(\d+(\.\d+)*).*<\/string>/);
    if (versionMatchRes) {
      localMacAppInfo.localVersion = versionMatchRes[1];
    }
  } catch (err) {
    consola.error('getLocalMacAppInfo', err);
  } finally {
    return localMacAppInfo;
  }
};

const getLocalCliInfo: GetLocalToolInfo = async (id: string) => {
  const localCliInfo = { ...DEFAULT_LOCAL_TOOL_INFO };
  console.time('getLocalCliInfo');
  try {
    // get local cli path
    const cliPathInfo = which(id);
    if (!cliPathInfo) {
      return localCliInfo;
    }
    let cliPath;
    if (typeof cliPathInfo === 'object') {
      cliPath = cliPathInfo.stdout;
    } else {
      cliPath = cliPathInfo;
    }
    localCliInfo.localPath = cliPath;
    localCliInfo.installed = true;
    // get cli version
    const stdout = await executeCommand(localCliInfo.localPath!, ['--version']);
    const cliVersionMatch = stdout.match(/(\d+(\.\d+)*)/);
    localCliInfo.localVersion = cliVersionMatch ? cliVersionMatch[1] : stdout;
  } catch (error) {
    consola.error('getLocalCliInfo', error);
  } finally {
    console.timeEnd('getLocalCliInfo');
    return localCliInfo;
  }
};

const getLocalNpmPackageInfo: GetLocalToolInfo = async (id: string) => {
  const localNpmPackageInfo = { ...DEFAULT_LOCAL_TOOL_INFO };
  console.time('getLocalNpmPackageInfo');
  if (!which('npm')) {
    consola.error('getLocalNpmPackageInfo', 'npm command is not found.');
    return localNpmPackageInfo;
  }
  try {
    // get local npm package path
    const localPath = which(id);
    if (!localPath) {
      return localNpmPackageInfo;
    }
    localNpmPackageInfo.localPath = localPath;
    localNpmPackageInfo.installed = true;
    // get local npm package version
    const ret = await executeCommand('npm', ['list', '-g', id, '--json']);
    const { dependencies } = JSON.parse(ret);
    if (dependencies && dependencies[id]) {
      localNpmPackageInfo.localVersion = dependencies[id].version;
    }
  } catch (err) {
    consola.error('getLocalNpmPackageInfo', err);
  } finally {
    console.timeEnd('getLocalNpmPackageInfo');
    return localNpmPackageInfo;
  }
};

const getLocalWindowsAppInfo: GetLocalToolInfo = async (id: string) => {
  // TODO:
  return {
    installed: true,
  };
};

const getLocalVSCodeExtInfo: GetLocalToolInfo = async (id: string) => {
  console.time('getLocalVSCodeExtInfo');
  const localVSCodeExtInfo = { ...DEFAULT_LOCAL_TOOL_INFO };
  if (!which(VSCODE_CLI_COMMAND_NAME)) {
    consola.error('getLocalVSCodeExtInfo', `${VSCODE_CLI_COMMAND_NAME} command is not found.`);
    return localVSCodeExtInfo;
  }
  try {
    // get local vscode extension version
    const stdout = await executeCommand(VSCODE_CLI_COMMAND_NAME, ['--list-extensions', '--show-versions']);
    const extensionsList = stdout.split('\n');
    const localExtensionInfo = extensionsList.find((ext: string) => (new RegExp(`${id}@`)).test(ext));
    if (localExtensionInfo) {
      const [, version] = localExtensionInfo.split('@');
      localVSCodeExtInfo.localVersion = version;
      localVSCodeExtInfo.installed = true;
    }
  } catch (err) {
    consola.error('getLocalVSCodeExtInfo', err);
  } finally {
    console.timeEnd('getLocalVSCodeExtInfo');
    return localVSCodeExtInfo;
  }
};

const getLocalToolInfoProcessor: Record<ToolType, GetLocalToolInfo> = {
  cli: getLocalCliInfo,
  macApp: getLocalMacAppInfo,
  vscodeExt: getLocalVSCodeExtInfo,
  npmPackage: getLocalNpmPackageInfo,
  windowsApp: getLocalWindowsAppInfo,
};

export default async function getLocalToolInfo(toolType: ToolType, toolId: string): Promise<LocalToolInfo> {
  const getLocalToolInfoFunc = (getLocalToolInfoProcessor[toolType]) as GetLocalToolInfo;
  try {
    const localToolInfo = await getLocalToolInfoFunc(toolId);
    return localToolInfo;
  } catch (error) {
    consola.error('getLocalToolInfo', error);
    return DEFAULT_LOCAL_TOOL_INFO;
  }
}
