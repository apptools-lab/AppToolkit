import * as path from 'path';
import ini = require('ini');
// import * as set from 'lodash.set';
import * as fse from 'fs-extra';
import { GLOBAL_GITCONFIG_PATH } from '../constants';
import log from '../utils/log';

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
      const userHomePath = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
      let userGitConfigPath = gitConfigPath.replace('~', userHomePath);
      if (!path.isAbsolute(userGitConfigPath)) {
        // .gitconfig-gitlab -> /Users/xx/.gitconfig-gitlab
        userGitConfigPath = path.join(userHomePath, userGitConfigPath);
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

      userGitConfigs.push({
        ...userGitConfig,
        name: userGitConfigName,
        gitDir: userGitDir,
        gitConfigPath: userGitConfigPath,
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

async function parseGitConfig(gitConfigPath: string) {
  const gitConfigContent = await fse.readFile(gitConfigPath, 'utf-8');
  return ini.parse(gitConfigContent);
}

async function writeGitConfig(gitConfigPath: string, config: object) {
  await fse.writeFile(gitConfigPath, ini.stringify(config, { whitespace: true }));
}
