import * as path from 'path';
import ini = require('ini');
import * as fse from 'fs-extra';
import * as globby from 'globby';
import { IAddUserConfig } from '../types/git';
import { GLOBAL_GITCONFIG_PATH, TOOLKIT_USER_GIT_CONFIG_DIR } from '../constants';
import log from '../utils/log';
import {
  // getSSHPublicKey,
  updateSSHConfig,
  getSSHConfig,
  // SSHDir,
  // rsaFileSuffix,
  removeSSHConfig,
  addSSHConfig,
} from './ssh';

const USER_GIT_CONFIG_FILENAME_PREFIX = '.gitconfig-';
// const HOME_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const IGNORE_CONFIG_KEYS = ['gitDir'];

export async function getGlobalGitConfig() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  log.info('get-global-git-config', globalGitConfig);
  return globalGitConfig;
}

export async function updateGlobalGitConfig(gitConfig: object) {
  log.info('update-global-git-config', gitConfig);
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, gitConfig);
}

export async function getExistedUserGitConfigNames() {
  const filenames = await getUserGitConfigFilenames();
  return filenames.map((filename: string) => filename.replace(USER_GIT_CONFIG_FILENAME_PREFIX, ''));
}

export async function getUserGitConfigs() {
  const gitConfigFilenames = await getUserGitConfigFilenames();

  const userGitConfigs = [];
  for (const gitConfigFilename of gitConfigFilenames) {
    const configPath = path.join(TOOLKIT_USER_GIT_CONFIG_DIR, gitConfigFilename);
    if (!fse.pathExistsSync(configPath)) {
      continue;
    }
    const gitConfig = await parseGitConfig(configPath);
    const filename = path.basename(configPath);
    const configName = filename.replace(USER_GIT_CONFIG_FILENAME_PREFIX, '');
    const { hostName, SSHPublicKey } = await getSSHConfig(configName);
    userGitConfigs.push({
      ...gitConfig,
      hostName,
      SSHPublicKey,
      configName,
    });
  }

  return userGitConfigs;
}
/**
 * get absolute git config path in ~/.toolkit/git/
 */
function getGitConfigPath(configName: string) {
  return path.join(TOOLKIT_USER_GIT_CONFIG_DIR, `${USER_GIT_CONFIG_FILENAME_PREFIX}${configName}`);
}

export async function addUserGitConfig(userGitConfig: IAddUserConfig) {
  const { configName, hostName, user: { name: userName } } = userGitConfig;
  const gitConfigPath = getGitConfigPath(configName);

  checkUserGitConfigExists(configName, gitConfigPath);

  await fse.createFile(gitConfigPath);
  // do not save the configName and SSHPublicKey to the gitconfig file
  delete userGitConfig.configName;
  delete userGitConfig.SSHPublicKey;
  await writeGitConfig(gitConfigPath, userGitConfig);
  await addSSHConfig({ hostName, configName, userName });
}

export async function updateUserGitConfig(gitConfig: any, configName: string) {
  const { hostName = '', user = {} } = gitConfig;
  const { name: userName = '' } = user;
  await updateSSHConfig(configName, hostName, userName);

  IGNORE_CONFIG_KEYS.forEach((key) => {
    delete gitConfig[key];
  });
  // save to ~/.toolkit/git/.gitconfig-${configName}
  const gitConfigPath = `${path.join(TOOLKIT_USER_GIT_CONFIG_DIR, `${USER_GIT_CONFIG_FILENAME_PREFIX}${configName}`)}`;
  await writeGitConfig(gitConfigPath, gitConfig);

  log.info('update-user-git-config', configName, gitConfig);
}

export async function updateUserGitDir(
  originGitDir: string,
  currentGitDir: string,
) {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);

  const originIncludeIfKey = `includeIf "gitdir:${originGitDir}"`;
  const currentIncludeIfKey = `includeIf "gitdir:${currentGitDir}"`;
  const includeIfValue = globalGitConfig[originIncludeIfKey];

  delete globalGitConfig[originIncludeIfKey];
  globalGitConfig[currentIncludeIfKey] = includeIfValue;

  await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);

  log.info('updateUserGitDir: ', currentIncludeIfKey, globalGitConfig[currentIncludeIfKey]);
}

export async function removeUserGitConfig(configName: string, gitDir: string) {
  // Remove SSH config section
  await removeSSHConfig(configName);

  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const globalGitConfigKeys = Object.keys(globalGitConfig);
  for (const key of globalGitConfigKeys) {
    if (key === `includeIf "gitdir:${gitDir}"`) {
      log.info('remove-user-git-config', globalGitConfig[key]);
      delete globalGitConfig[key];
      break;
    }
  }

  // update gitConfig to ~/.gitconfig
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);
  // remove the gitconfig file
  const gitConfigPath = getGitConfigPath(configName);
  await fse.remove(gitConfigPath);
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
    const err = new Error(`${configName} 配置已存在，请使用其他配置名称`);
    err.name = 'add-user-git-config';
    log.error(err);
    throw err;
  }
}

async function getUserGitConfigFilenames() {
  return await globby([`${USER_GIT_CONFIG_FILENAME_PREFIX}*`], { cwd: TOOLKIT_USER_GIT_CONFIG_DIR, dot: true });
}
