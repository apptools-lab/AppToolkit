import * as path from 'path';
import * as os from 'os';
import type { LocalToolInfo } from '../../types';

// path
const HOME_DIR = os.homedir();
export const TMP_DIR = path.join(HOME_DIR, '.AppToolkit');
export const MAC_APPS_DIR_PATH = '/Applications';

// default value
export const DEFAULT_LOCAL_TOOL_INFO: LocalToolInfo = {
  installed: false,
  upgradable: false,
  localPath: null,
  localVersion: null,
};