import ini = require('ini');
// import * as set from 'lodash.set';
import * as fse from 'fs-extra';
import { GLOBAL_GITCONFIG_PATH } from '../constants';
import log from '../utils/log';

export async function getGitConfig(configWorkspaceDir?: string) {
  const globalGitConfig = await parseGitConfig(GLOBAL_GITCONFIG_PATH);
  let gitConfig = globalGitConfig;
  if (configWorkspaceDir) {
    gitConfig = {};
  }

  log.info('Get GitConfig: ', gitConfig);
  return gitConfig;
}

export async function setGitConfig({ gitConfig, configWorkspaceDir }: { gitConfig: any; configWorkspaceDir?: string }) {
  // TODO: get user git config path
  const gitConfigPath = configWorkspaceDir ? '' : GLOBAL_GITCONFIG_PATH;
  // const gitConfig = parseGitConfig(gitConfigPath);
  // set(gitConfig, key, value);
  log.info('Set GitConfig: ', gitConfig);
  await writeGitConfig(gitConfigPath, gitConfig);
}


async function parseGitConfig(gitConfigPath: string) {
  const gitConfigContent = await fse.readFile(gitConfigPath, 'utf-8');
  return ini.parse(gitConfigContent);
}

async function writeGitConfig(gitConfigPath: string, config: object) {
  await fse.writeFile(gitConfigPath, ini.stringify(config, { whitespace: true }));
}
