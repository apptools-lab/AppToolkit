import * as path from 'path';
import * as globby from 'globby';
import * as fse from 'fs-extra';
import { DEFAULT_LOCAL_PACKAGE_INFO, HOME_DIR, TOOLKIT_PACKAGES_DIR } from '../../constants';
import { BasePackageInfo, LocalPackageInfo } from '../../types';
import getPackageFileName from '../../utils/getPackageFileName';

// chrome extension path
const MAC_CHROME_EXTENSIONS_PATH = path.join(HOME_DIR, 'Library/Application Support/Google/Chrome/Default/Extensions');

async function getChromeExtensionInfo(basePackageInfo: BasePackageInfo) {
  const extensionInfo: LocalPackageInfo = { ...DEFAULT_LOCAL_PACKAGE_INFO };
  const { id } = basePackageInfo;

  const packageFileName = getPackageFileName(basePackageInfo);
  const sourceFilePath = path.join(TOOLKIT_PACKAGES_DIR, packageFileName);
  const sourceFileExists = await fse.pathExists(sourceFilePath);
  if (sourceFileExists) {
    // local package(.crx) path
    extensionInfo.packagePath = sourceFilePath;
  }

  const extensionPath = path.join(MAC_CHROME_EXTENSIONS_PATH, id);
  const paths = await globby(['*/manifest.json'], { deep: 2, cwd: extensionPath });
  if (paths.length) {
    const { version } = await fse.readJSON(path.join(extensionPath, paths[0]));
    extensionInfo.versionStatus = 'installed';
    extensionInfo.localVersion = version;
    extensionInfo.localPath = extensionPath;
  }

  return extensionInfo;
}

export default getChromeExtensionInfo;
