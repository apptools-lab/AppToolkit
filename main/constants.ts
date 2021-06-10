import * as path from 'path';
import { ILocalPackageInfo } from './types';

export const APPLICATIONS_DIR_PATH = '/Applications';

export const PACKAGE_JSON_FILE_NAME = 'package.json';

export const TOOLKIT_DIR = path.join(process.env.HOME, '.toolkit');
export const TOOLKIT_TMP_DIR = path.join(TOOLKIT_DIR, '.tmp');
export const TOOLKIT_PACKAGES_DIR = path.join(TOOLKIT_DIR, 'packages');

export const DEFAULT_LOCAL_PACKAGE_INFO: ILocalPackageInfo = {
  localVersion: null,
  localPath: null,
  versionStatus: 'uninstalled',
};

export const VSCODE_CLI_COMAMND_NAME = 'code';

export const INSTALL_COMMAND_PACKAGES = [
  {
    name: 'Visual Studio Code',
    command: 'code',
    commandRelativePath: './Contents/Resources/app/bin/code',
  },
];

export const NOT_REINSTALL_PACKAGES = ['npm'];

export const TAOBAO_NPM_REGISTRY = 'https://registry.npm.taobao.org';
export const ALI_NPM_REGISTRY = 'https://registry.npm.alibaba-inc.com/';
export const TAOBAO_NODE_MIRROR = 'https://npm.taobao.org/mirrors/node';
