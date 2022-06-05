import * as path from 'path';
import fse from 'fs-extra';
import simpleGit from 'simple-git';
import { APP_TOOLKIT_TMP_DIR } from '@/constants';
import transformStrToBool from '@/utils/transformStrToBool';
import type { GitConfigScope } from 'simple-git';
import type { GitConfig } from '../../../types';

const userConfigDir = path.join(APP_TOOLKIT_TMP_DIR, 'git', 'user-config');
const gitDirStr = 'includeif.gitdir:';

export async function getGlobalGitConfig() {
  const globalConfigList = await getGitConfigList({ scope: 'global' });
  const { files: [globalConfigKey], values } = globalConfigList;

  const globalConfig = {
    ...values[globalConfigKey],
  } as Record<string, string>;

  return transformStrToBool(globalConfig);
}

export async function setGlobalGitConfig(config: GitConfig) {
  await setGitConfig({ config, scope: 'global' });
}

export async function addUserGitConfig(configId: string) {
  const baseDir = path.join(userConfigDir, configId);
  if (fse.pathExistsSync(baseDir)) {
    throw new Error(`Git user config has already existed in ${baseDir}.`);
  }
  await fse.ensureDir(baseDir);
  await initGit(baseDir);

  return getUserConfigPath(configId);
}

export async function getUserGitConfig(configId: string) {
  const baseDir = path.join(userConfigDir, configId);
  const configList = await getGitConfigList({ baseDir, scope: 'local' });
  const { files: [globalConfigKey], values } = configList;

  const userConfig = {
    ...values[globalConfigKey],
  } as Record<string, string>;

  return userConfig;
}

export async function setUserGitConfig(configId: string, config: GitConfig) {
  const baseDir = path.join(userConfigDir, configId);
  await setGitConfig({ scope: 'local', baseDir, config });
}

export async function removeUserGitConfig(configId: string) {
  const configPath = path.join(userConfigDir, configId);
  await fse.remove(configPath);
}

export async function getUserGitDirs(configId: string): Promise<string[]> {
  const globalGitConfig = await getGlobalGitConfig();

  const gitDirs = [];
  for (const key of Object.keys(globalGitConfig)) {
    if (key.startsWith(gitDirStr)) {
      const gitDir = key.replace(gitDirStr, '').replace(/\.path$/, '');
      const value = globalGitConfig[key];
      // for example: value = '/Users/luhc228/.AppToolkit/git/user-config/github/.git/config'
      const pathItems = value.split(path.sep);
      const currentConfigId = pathItems[pathItems.length - 3];
      if (configId === currentConfigId) {
        gitDirs.push(gitDir);
      }
    }
  }

  return gitDirs;
}

export async function setUserGitDir(configId: string, dirPath: string) {
  const key = `${gitDirStr}${dirPath}${dirPath.endsWith(path.sep) ? '' : path.sep}.path`;
  await setGlobalGitConfig({
    [key]: path.join(userConfigDir, configId, '.git', 'config'),
  });
}
// TODO:
export async function removeUserGitDir(configId: string, dirPath: string) {
  const key = `${gitDirStr}${dirPath}${dirPath.endsWith(path.sep) ? '' : path.sep}.path`;
  const globalGitConfig = await getGlobalGitConfig();
  const configPath = globalGitConfig[key];

  setGlobalGitConfig({
    [key]: path.join(userConfigDir, configId, '.git', 'config'),
  });
}

/**
 * for example: /xxx/test/.git/config
 */
export function getUserConfigPath(configId: string) {
  const configPath = path.join(userConfigDir, configId, '.git', 'config');
  if (!fse.pathExistsSync(configPath)) {
    throw new Error(`Git config ${configPath} is not found.`);
  }
  return configPath;
}

async function initGit(baseDir: string) {
  const git = simpleGit({ baseDir });
  await git.init();
}

async function getGitConfigList(
  {
    baseDir,
    scope,
  }: {
    baseDir?: string;
    scope: keyof typeof GitConfigScope;
  }) {
  const git = simpleGit({ baseDir });
  return git.listConfig(scope);
}

async function setGitConfig({
  config,
  scope,
  baseDir,
}: {
  config: Record<string, string>;
  scope: keyof typeof GitConfigScope;
  baseDir?: string;
}) {
  const git = simpleGit({ baseDir });
  const configKeys = Object.keys(config);
  for (const key of configKeys) {
    const value = config[key];
    await git.addConfig(key, value, false, scope);
  }
}
