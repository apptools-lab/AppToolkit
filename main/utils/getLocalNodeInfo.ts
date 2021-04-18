import * as execa from 'execa';
import * as fse from 'fs-extra';
import * as path from 'path';
import getLocalToolInfo from './getLocalToolInfo';

interface INodeVersionManagerInfo {
  managerPath: string | null;
  managerVersion: string | null;
}

function getLocalNodeInfo(name: string, managerName: string, latestVersion: string | null) {
  let localNodeInfo = getLocalToolInfo(name, latestVersion);

  let nodeManagerInfo: INodeVersionManagerInfo = { managerPath: null, managerVersion: null };
  if (managerName === 'nvm') {
    nodeManagerInfo = getNvmInfo();
  }
  const { managerPath, managerVersion } = nodeManagerInfo;
  /**
   * there are four cases about node version info checking
   * 1. has installed nvm and installed node
   * 2. has installed node but not installed nvm
   * 3. has installed nvm but not installed node
   * 4. has not installed nvm or not installed node
   */
  localNodeInfo = Object.assign(localNodeInfo, { managerVersion, managerPath });
  if (!(managerPath && managerVersion)) {
    localNodeInfo.warningMessage =
      `Detect that you have installed Node but have not installed ${managerName}. We recommend you to install ${managerName} to manage node Version.`;
    // TODO:
    localNodeInfo.installStatus = 'notInstalled';
  }

  return localNodeInfo;
}

function getNvmInfo(): INodeVersionManagerInfo {
  const nvmInfo: INodeVersionManagerInfo = {
    managerPath: null,
    managerVersion: null,
  };
  const nvmDirRes = execa.sync('echo', ['"$NVM_DIR"'], { shell: true });
  if (nvmDirRes) {
    const nvmDir = nvmDirRes.stdout;
    nvmInfo.managerPath = nvmDir;
    const nvmPackageJsonPath = path.join(nvmDir, 'package.json');
    if (fse.pathExistsSync(nvmPackageJsonPath)) {
      const nvmPkgJSON = fse.readJSONSync(nvmPackageJsonPath);
      if (nvmPkgJSON) {
        const { version } = nvmPkgJSON;
        nvmInfo.managerVersion = version;
      }
    }
  }

  return nvmInfo;
}


export default getLocalNodeInfo;
