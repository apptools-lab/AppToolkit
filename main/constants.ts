import * as path from 'path';
import { ILocalPackageInfo } from './types';

export const APPLICATIONS_DIR_PATH = '/Applications';

export const PACKAGE_JSON_FILE_NAME = 'package.json';

export const TOOLKIT_TMP_DIR = path.join(process.env.HOME, '.toolkit');

export const DEFAULT_LOCAL_PACKAGE_INFO: ILocalPackageInfo = {
  localVersion: null,
  localPath: null,
  versionStatus: 'uninstalled',
};
