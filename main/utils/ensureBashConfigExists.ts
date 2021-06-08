import * as path from 'path';
import * as fse from 'fs-extra';
import * as shell from 'shelljs';
import { BASH_CONFIG_FILES } from '../constants';
import log from '../utils/log';

/**
 * Ensure bash config file exists. Otherwise, create .bashrc_profile file
 */
function ensureBashConfigExists() {
  const bashConfigExists = BASH_CONFIG_FILES.some((bashConfigFile: string) => {
    return fse.pathExistsSync(path.join(process.env.HOME, bashConfigFile));
  });
  if (!bashConfigExists) {
    const defaultBashConfigFilePath = path.join(process.env.HOME, BASH_CONFIG_FILES[0]);
    log.info(`${BASH_CONFIG_FILES.join(',')} were not found. Create ${defaultBashConfigFilePath}.`);
    shell.touch(defaultBashConfigFilePath);
  }
}

export default ensureBashConfigExists;
