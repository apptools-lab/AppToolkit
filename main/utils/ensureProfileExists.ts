import * as path from 'path';
import * as fse from 'fs-extra';
import * as shell from 'shelljs';
import { PROFILE_FILES, DEFAULT_PROFILE_FILE } from '../constants';
import log from './log';

/**
 * Ensure profile file exists. Otherwise,dcreate ~/.bash_profile file by default.
 */
function ensureProfileExists() {
  const isProfileExists = PROFILE_FILES.some((bashConfigFile: string) => {
    return fse.pathExistsSync(path.join(process.env.HOME, bashConfigFile));
  });
  if (!isProfileExists) {
    const defaultBashConfigFilePath = path.join(process.env.HOME, DEFAULT_PROFILE_FILE);
    log.info(`${PROFILE_FILES.join(',')} were not found. Create ${defaultBashConfigFilePath}.`);
    shell.touch(defaultBashConfigFilePath);
  }
}

export default ensureProfileExists;
