import * as path from 'path';
import * as fse from 'fs-extra';
import * as shell from 'shelljs';
import { PROFILE_FILES, BASH_PROFILE_FILE_NAME, ZSHRC_FILE_NAME } from '../constants';
import log from './log';
import getShellName from './getShellName';

/**
 * Ensure profile file exists. Otherwise, create ~/.bash_profile file by default.
 */
function ensureProfileExists() {
  const isProfileExists = PROFILE_FILES.some((bashConfigFile: string) => {
    return fse.pathExistsSync(path.join(process.env.HOME, bashConfigFile));
  });
  if (!isProfileExists) {
    const shellName = getShellName();
    const profilePath = path.join(process.env.HOME, shellName === 'zsh' ? ZSHRC_FILE_NAME : BASH_PROFILE_FILE_NAME);
    log.info(`${PROFILE_FILES.join(',')} were not found. Create ${profilePath}.`);
    shell.touch(profilePath);
  }
}

export default ensureProfileExists;
