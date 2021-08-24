import * as path from 'path';
import ini = require('ini');
import * as fse from 'fs-extra';
import * as globby from 'globby';
import { AddUserConfig, UserGitConfig } from '../types';
import { GLOBAL_GITCONFIG_PATH, TOOLKIT_USER_GIT_CONFIG_DIR } from '../constants';
import log from '../utils/log';
import {
  updateSSHConfig,
  getSSHConfig,
  removeSSHConfig,
  addSSHConfig,
} from './ssh';
import { record } from '../recorder';

const USER_GIT_CONFIG_FILENAME_PREFIX = '.gitconfig-';
const IGNORE_CONFIG_KEYS = ['gitDir'];

export async function getGlobalGitConfig() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  log.info('get-global-git-config', globalGitConfig);
  return globalGitConfig;
}

export async function updateGlobalGitConfig(gitConfig: object) {
  log.info('update-global-git-config', gitConfig);
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, gitConfig);
  record({
    module: 'git',
    action: 'updateGlobalGitConfig',
  });
}

export async function getExistedUserGitConfigNames() {
  const filenames = await getUserGitConfigFilenames();
  return filenames.map((filename: string) => filename.replace(USER_GIT_CONFIG_FILENAME_PREFIX, ''));
}

/**
 * get user git config list
 */
export async function getUserGitConfigs(): Promise<UserGitConfig[]> {
  const gitConfigFilenames = await getUserGitConfigFilenames();
  const userGitDirs = await getUserGitDirs();

  const userGitConfigs = [];
  for (const gitConfigFilename of gitConfigFilenames) {
    const configPath = path.join(TOOLKIT_USER_GIT_CONFIG_DIR, gitConfigFilename);
    if (!fse.pathExistsSync(configPath)) {
      continue;
    }
    const gitConfig = await parseGitConfig(configPath);
    const filename = path.basename(configPath);
    const configName = filename.replace(USER_GIT_CONFIG_FILENAME_PREFIX, '');
    const { SSHPublicKey } = await getSSHConfig(configName);
    userGitConfigs.push({
      ...gitConfig,
      SSHPublicKey,
      configName,
      gitDirs: userGitDirs[configPath] || [],
    });
  }

  return userGitConfigs;
}

export async function addUserGitConfig(userGitConfig: AddUserConfig) {
  const { configName, user: { name: userName, hostName } } = userGitConfig;
  const gitConfigPath = getGitConfigPath(configName);

  checkUserGitConfigExists(configName, gitConfigPath);

  await fse.createFile(gitConfigPath);
  // do not save the configName to the gitconfig file
  delete userGitConfig.configName;
  await writeGitConfig(gitConfigPath, userGitConfig);
  await addSSHConfig({ hostName, configName, userName });
  record({
    module: 'git',
    action: 'addUserGitConfig',
  });
}

export async function updateUserGitConfig(gitConfig: any, configName: string) {
  const { user = {} } = gitConfig;
  const { name: userName = '', hostName = '' } = user;
  await updateSSHConfig(configName, hostName, userName);

  IGNORE_CONFIG_KEYS.forEach((key) => {
    delete gitConfig[key];
  });
  // save to ~/.toolkit/git/.gitconfig-${configName}
  const gitConfigPath = `${path.join(TOOLKIT_USER_GIT_CONFIG_DIR, `${USER_GIT_CONFIG_FILENAME_PREFIX}${configName}`)}`;
  await writeGitConfig(gitConfigPath, gitConfig);

  log.info('update-user-git-config', configName, gitConfig);
  record({
    module: 'git',
    action: 'updateUserGitConfig',
  });
}

async function getUserGitDirs() {
  const globalGitConfig = await getGlobalGitConfig();

  const userGitDirs = {};

  const configKeys = Object.keys(globalGitConfig);

  for (const configKey of configKeys) {
    const { path: gitConfigPath } = globalGitConfig[configKey];
    if (!gitConfigPath) {
      continue;
    }
    if (!userGitDirs[gitConfigPath]) {
      userGitDirs[gitConfigPath] = [];
    }
    const gitDir = configKey.replace(/includeIf "gitdir:(.*)"/, (match, p1) => p1);
    userGitDirs[gitConfigPath].push(gitDir);
  }

  return userGitDirs;
}

export async function updateUserGitDir(
  originGitDir: string,
  currentGitDir: string,
  configName: string,
) {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);

  const originIncludeIfKey = `includeIf "gitdir:${originGitDir}"`;
  const currentIncludeIfKey = `includeIf "gitdir:${currentGitDir}"`;

  delete globalGitConfig[originIncludeIfKey];
  const gitConfigPath = getGitConfigPath(configName);
  globalGitConfig[currentIncludeIfKey] = { path: gitConfigPath };
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);

  log.info('update-user-git-dir: ', currentIncludeIfKey, globalGitConfig[currentIncludeIfKey]);
  record({
    module: 'git',
    action: 'updateUserGitDir',
  });
}

export async function removeUserGitDir(gitDir: string, configName: string) {
  const gitConfigPath = getGitConfigPath(configName);
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);

  const includeIfKey = `includeIf "gitdir:${gitDir}"`;
  const includeIfValue = globalGitConfig[includeIfKey];
  if (includeIfValue && includeIfValue.path === gitConfigPath) {
    delete globalGitConfig[includeIfKey];
    await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);
    log.info('remove-user-git-dir: ', includeIfKey, gitConfigPath);
    record({
      module: 'git',
      action: 'removeUserGitDir',
    });
  } else {
    const error = new Error(`Can not remove ${gitDir}. The ${includeIfValue} is not found.`);
    log.error(error);
    throw error;
  }
}

export async function removeUserGitConfig(configName: string, gitDirs = []) {
  await removeSSHConfig(configName);

  for (const gitDir of gitDirs) {
    await removeUserGitDir(gitDir, configName);
  }

  // remove the gitconfig file
  const gitConfigPath = getGitConfigPath(configName);
  await fse.remove(gitConfigPath);

  record({
    module: 'git',
    action: 'removeUserGitConfig',
  });
}

async function parseGitConfig(gitConfigPath: string) {
  const gitConfigContent = await fse.readFile(gitConfigPath, 'utf-8');
  return ini.parse(gitConfigContent);
}

async function writeGitConfig(gitConfigPath: string, config: object) {
  await fse.writeFile(gitConfigPath, ini.stringify(config));
  log.info('write-git-config', config);
}

function checkUserGitConfigExists(configName: string, gitConfigPath: string) {
  if (fse.pathExistsSync(gitConfigPath)) {
    const err = new Error(`${configName} config has existed，please use other config name.`);
    err.name = 'add-user-git-config';
    log.error(err);
    throw err;
  }
}

async function getUserGitConfigFilenames() {
  return await globby([`${USER_GIT_CONFIG_FILENAME_PREFIX}*`], { cwd: TOOLKIT_USER_GIT_CONFIG_DIR, dot: true });
}

/**
 * get absolute git config path in ~/.toolkit/git/
 */
function getGitConfigPath(configName: string) {
  return path.join(TOOLKIT_USER_GIT_CONFIG_DIR, `${USER_GIT_CONFIG_FILENAME_PREFIX}${configName}`);
}
