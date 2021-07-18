import * as path from 'path';
import ini = require('ini');
import * as fse from 'fs-extra';
import { GLOBAL_GITCONFIG_PATH } from '../constants';
import log from '../utils/log';
import { getSSHPublicKey } from './ssh';

const GIT_CONFIG_DIR = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

export async function getGlobalGitConfig() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  log.info('Global git config: ', globalGitConfig);
  return globalGitConfig;
}

export async function getUserGitConfigs() {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const globalGitConfigKeys = Object.keys(globalGitConfig);
  const userGitConfigs = [];

  for (const key of globalGitConfigKeys) {
    if (/^includeIf "gitdir:/.test(key)) {
      const gitConfigPath = globalGitConfig[key].path || '';
      let userGitConfigPath = gitConfigPath.replace('~', GIT_CONFIG_DIR);
      if (!path.isAbsolute(userGitConfigPath)) {
        // .gitconfig-gitlab -> /Users/xx/.gitconfig-gitlab
        userGitConfigPath = path.join(GIT_CONFIG_DIR, userGitConfigPath);
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
      const sshPublicKey = await getSSHPublicKey(userGitConfigName);
      userGitConfigs.push({
        ...userGitConfig,
        name: userGitConfigName,
        gitDir: userGitDir,
        gitConfigPath: userGitConfigPath,
        sshPublicKey,
      });
    }
  }

  log.info('userGitConfigs: ', userGitConfigs);
  return userGitConfigs;
}

export async function setGitConfig(gitConfig: any, gitConfigPath?: string) {
  // TODO: get user git config path
  gitConfigPath = gitConfigPath || GLOBAL_GITCONFIG_PATH;
  // const gitConfig = parseGitConfig(gitConfigPath);
  // set(gitConfig, key, value);
  log.info('Set git config: ', gitConfig);
  await writeGitConfig(gitConfigPath, gitConfig);
}

export async function addUserGitConfig(name: string, gitDir: string) {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  const includeIfKey = `includeIf "gitdir:${gitDir}"`;
  if (globalGitConfig[includeIfKey]) {
    const err = new Error(`目录 ${gitDir} 已被设置，请使用其他目录`);
    log.error(err);
    throw err;
  }
  const gitConfigPath = `${path.join(GIT_CONFIG_DIR, `.gitconfig-${name}`)}`;
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

  // const originIncludeIfKey = `includeIf "gitdir:${originConfig.gitDir}"`;
  // const currentIncludeIfKey = `includeIf "gitdir:${currentConfig.gitDir}"`;
  // const currentGitConfigPath = `${path.join(GIT_CONFIG_DIR, `.gitconfig-${currentConfig.name}`)}`;

  // delete globalGitConfig[originIncludeIfKey];
  // globalGitConfig[currentIncludeIfKey] = {
  //   path: currentGitConfigPath,
  // };
  // await writeGitConfig(GLOBAL_GITCONFIG_PATH, globalGitConfig);

  // if (originConfig.name !== currentConfig.name) { // avoid too many file operations
  //   const originGitConfigPath = `${path.join(GIT_CONFIG_DIR, `.gitconfig-${originConfig.name}`)}`;
  //   await fse.copyFile(originGitConfigPath, currentGitConfigPath);
  //   await fse.remove(originGitConfigPath);
  // }
}

export async function removeUserGitConfig(gitDir: string, gitConfigPath: string) {
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
}
