import * as path from 'path';
import ini = require('ini');
import * as fse from 'fs-extra';
import { GLOBAL_GITCONFIG_PATH } from '../constants';
import log from '../utils/log';
import {
  getSSHPublicKey,
  updateSSHConfig,
  getSSHConfigs,
  SSHDir,
  rsaFileSuffix,
  removeSSHConfig,
} from './ssh';

const HOME_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const IGNORE_CONFIG_KEYS = ['gitDir', 'hostName'];

export async function getGlobalGitConfig() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  log.info('get-global-git-config', globalGitConfig);
  return globalGitConfig;
}

export async function updateGlobalGitConfig(gitConfig: object) {
  log.info('update-global-git-config', gitConfig);
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, gitConfig);
}

export async function getUserGitConfigs() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const globalGitConfigKeys = Object.keys(globalGitConfig);
  const userGitConfigs = [];

  for (const key of globalGitConfigKeys) {
    if (/^includeIf "gitdir:/.test(key)) {
      const gitConfigPath = globalGitConfig[key].path || '';
      let userGitConfigPath = gitConfigPath.replace('~', HOME_DIR);
      if (!path.isAbsolute(userGitConfigPath)) {
        // .gitconfig-gitlab -> /Users/xx/.gitconfig-gitlab
        userGitConfigPath = path.join(HOME_DIR, userGitConfigPath);
      }
      const userGitConfigPathExists = await fse.pathExists(userGitConfigPath);
      if (!userGitConfigPathExists) {
        continue;
      }

      const userGitConfig = await parseGitConfig(userGitConfigPath);
      // e.g.: gitlab
      const userGitConfigName = path.basename(userGitConfigPath).replace('.gitconfig-', '');
      let userGitDir = '';
      const userGitDirMatchRes = key.match(/^includeIf "gitdir:(.*)"/);
      if (userGitDirMatchRes) {
        // e.g.: /Users/workspace/gitlab/
        userGitDir = userGitDirMatchRes[1];
      }

      let SSHPublicKey = '';
      let hostName = '';
      const privateKeyPath = path.join(SSHDir, `${userGitConfigName}${rsaFileSuffix}`);
      const SSHConfigSections = await getSSHConfigs();
      // eslint-disable-next-line no-labels
      loopLabel:
      for (const section of SSHConfigSections) {
        const { config = [], value: HostName } = section;
        for (const { param, value } of config) {
          if (param === 'IdentityFile' && value.replace('~', HOME_DIR) === privateKeyPath) {
            hostName = HostName;
            SSHPublicKey = await getSSHPublicKey(privateKeyPath);
            // eslint-disable-next-line no-labels
            break loopLabel;
          }
        }
      }

      userGitConfigs.push({
        ...userGitConfig,
        configName: userGitConfigName,
        gitDir: userGitDir,
        gitConfigPath: userGitConfigPath,
        hostName,
        SSHPublicKey,
      });
    }
  }

  log.info('get-user-git-configs', userGitConfigs);
  return userGitConfigs;
}

export async function addUserGitConfig(configName: string, gitDir: string) {
  const gitConfigPath = `${path.join(HOME_DIR, `.gitconfig-${configName}`)}`;
  if (fse.pathExistsSync(gitConfigPath)) {
    const err = new Error(`${configName} Git 配置已存在，请使用其他配置名称`);
    err.name = 'add-user-git-config';
    log.error(err);
    throw err;
  }

  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const includeIfKey = `includeIf "gitdir:${gitDir}"`;
  if (globalGitConfig[includeIfKey]) {
    const err = new Error(`目录 ${gitDir} 已被设置，请使用其他目录`);
    err.name = 'add-user-git-config';
    log.error(err);
    throw err;
  }

  globalGitConfig[includeIfKey] = {
    path: gitConfigPath,
  };

  // append git config to ~/.gitconfig
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);

  // create ~/.gitconfig-gitlab
  await fse.createFile(gitConfigPath);

  log.info('add-user-git-config', includeIfKey, globalGitConfig[includeIfKey]);
}

export async function updateUserGitConfig(gitConfig: any, configName: string, gitConfigPath: string) {
  const { hostName = '', user = {} } = gitConfig;
  const { name: userName = '' } = user;
  await updateSSHConfig(configName, hostName, userName);

  IGNORE_CONFIG_KEYS.forEach((key) => {
    delete gitConfig[key];
  });

  await writeGitConfig(gitConfigPath, gitConfig);
  log.info('update-user-git-config', gitConfigPath, gitConfig);
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

export async function removeUserGitConfig(configName: string, gitDir: string, gitConfigPath: string) {
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
  await fse.remove(gitConfigPath);
}

async function parseGitConfig(gitConfigPath: string) {
  const gitConfigContent = await fse.readFile(gitConfigPath, 'utf-8');
  return ini.parse(gitConfigContent);
}

async function writeGitConfig(gitConfigPath: string, config: object) {
  await fse.writeFile(gitConfigPath, ini.stringify(config, { whitespace: true }));
  log.info('write-git-config', config);
}
