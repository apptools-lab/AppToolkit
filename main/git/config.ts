import * as path from 'path';
import ini = require('ini');
import * as fse from 'fs-extra';
import { GLOBAL_GITCONFIG_PATH } from '../constants';
import log from '../utils/log';
import {
  getSSHPublicKey,
  updateSSHConfig,
  getSSHConfigs,
  sshConfigDir,
  rsaFileSuffix,
  removeSSHConfig,
} from './ssh';

const HOME_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const IGNORE_CONFIG_KEYS = ['gitDir', 'hostName'];

export async function getGlobalGitConfig() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);

  log.info('Global git config: ', globalGitConfig);

  return globalGitConfig;
}

export async function updateGlobalGitConfig(gitConfig: object) {
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

      let sshPublicKey = '';
      let hostName = '';
      const privateKeyPath = path.join(sshConfigDir, `${userGitConfigName}${rsaFileSuffix}`);
      const sshConfigs = await getSSHConfigs();
      // eslint-disable-next-line no-labels
      loopLabel:
      for (const sshConfig of sshConfigs) {
        const { config = [], value: HostName } = sshConfig;
        for (const { param, value } of config) {
          if (param === 'IdentityFile' && value.replace('~', HOME_DIR) === privateKeyPath) {
            hostName = HostName;
            sshPublicKey = await getSSHPublicKey(privateKeyPath);
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
        sshPublicKey,
      });
    }
  }

  log.info('userGitConfigs: ', userGitConfigs);
  return userGitConfigs;
}

export async function updateUserGitConfig(currentGitConfig: object, configName: string, gitConfigPath: string) {
  await updateSSHConfig(currentGitConfig, configName);

  IGNORE_CONFIG_KEYS.forEach((key) => {
    delete currentGitConfig[key];
  });
  await writeGitConfig(gitConfigPath, currentGitConfig);
}

export async function addUserGitConfig(configName: string, gitDir: string) {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const includeIfKey = `includeIf "gitdir:${gitDir}"`;

  if (globalGitConfig[includeIfKey]) {
    const err = new Error(`目录 ${gitDir} 已被设置，请使用其他目录`);
    log.error(err);
    throw err;
  }

  const gitConfigPath = `${path.join(HOME_DIR, `.gitconfig-${configName}`)}`;
  globalGitConfig[includeIfKey] = {
    path: gitConfigPath,
  };

  // append git config to ~/.gitconfig
  await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);

  // create ~/.gitconfig-gitlab
  await fse.createFile(gitConfigPath);
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
}

export async function removeUserGitConfig(configName: string, gitDir: string, gitConfigPath: string, gitConfig: any) {
  await removeSSHConfig(gitConfig, configName);
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const globalGitConfigKeys = Object.keys(globalGitConfig);
  for (const key of globalGitConfigKeys) {
    if (key === `includeIf "gitdir:${gitDir}"`) {
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
  log.info('Set git config: ', config);
}
