import * as path from 'path';
import * as os from 'os';
import { LocalPackageInfo } from './types';

export const APPLICATIONS_DIR_PATH = '/Applications';
export const HOME_DIR = os.homedir();
export const PACKAGE_JSON_FILE_NAME = 'package.json';

export const TOOLKIT_DIR = path.join(process.env.HOME, '.toolkit');
export const TOOLKIT_TMP_DIR = path.join(TOOLKIT_DIR, 'tmp');
export const TOOLKIT_PACKAGES_DIR = path.join(TOOLKIT_DIR, 'packages');
export const TOOLKIT_USER_GIT_CONFIG_DIR = path.join(TOOLKIT_DIR, 'git');

export const DEFAULT_LOCAL_PACKAGE_INFO: LocalPackageInfo = {
  localVersion: null,
  localPath: null,
  versionStatus: 'uninstalled',
};

export const VSCODE_COMMAND_NAME = 'code';
export const VSCODE_NAME = 'Visual Studio Code';

export const INSTALL_COMMAND_PACKAGES = [
  {
    name: VSCODE_NAME,
    command: VSCODE_COMMAND_NAME,
    commandRelativePath: './Contents/Resources/app/bin/code',
  },
];
// bash profile
export const ZSHRC_FILE_NAME = '.zshrc';
export const BASH_PROFILE_FILE_NAME = '.bash_profile';
export const PROFILE_FILES = [BASH_PROFILE_FILE_NAME, '.bashrc', ZSHRC_FILE_NAME];
// npm
export const NPMRC_PATH = path.join(HOME_DIR, '.npmrc');
export const NPM_REGISTRY = 'https://registry.npmjs.org/';
export const TAOBAO_NPM_REGISTRY = 'https://registry.npm.taobao.org';
export const TAOBAO_NODE_MIRROR = 'https://npm.taobao.org/mirrors/node';
export const REGISTRY_FIELD = 'registry';
// git
export const GLOBAL_GITCONFIG_PATH = path.join(HOME_DIR, '.gitconfig');
