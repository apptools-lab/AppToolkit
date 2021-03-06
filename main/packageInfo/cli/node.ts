import * as path from 'path';
import * as execa from 'execa';
import { NodeVersionManagerInfo } from '../../types';
import log from '../../utils/log';
import getShellName from '../../utils/getShellName';
import getLocalCliInfo from './cli';
import getSourcePath from '../../utils/getSourcePath';

const nodeManagerInfoProcessor = {
  nvm: getNvmInfo,
};

async function getLocalNodeInfo(
  name: string,
  latestVersion: string | null,
  options: { [k: string]: any },
) {
  const { managerName } = options;
  let localNodeInfo = await getLocalCliInfo(name, latestVersion);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  let nodeManagerInfo = {} as NodeVersionManagerInfo;
  const getNodeManagerInfoFunc = nodeManagerInfoProcessor[managerName];
  if (getNodeManagerInfoFunc) {
    nodeManagerInfo = await getNodeManagerInfoFunc();
  }
  localNodeInfo = Object.assign(localNodeInfo, nodeManagerInfo);
  if (
    localNodeInfo.versionStatus !== 'uninstalled' &&
    nodeManagerInfo.managerVersionStatus === 'uninstalled'
  ) {
    localNodeInfo.warningMessage =
      `检测到你已经安装了 Node.js，但未安装 ${managerName}。推荐安装 ${managerName} 以更好管理 Node.js 版本。`;
    localNodeInfo.versionStatus = 'uninstalled';
  }

  return localNodeInfo;
}

async function getNvmInfo(): Promise<NodeVersionManagerInfo> {
  const nvmInfo: NodeVersionManagerInfo = {
    managerVersionStatus: 'uninstalled',
  };
  const shFilePath = getSourcePath(path.join(__dirname, '../..'), 'data/shells', 'is-nvm-installed.sh');
  try {
    const { stdout } = await execa(getShellName(), [shFilePath]);
    if (stdout === 'nvm') {
      nvmInfo.managerVersionStatus = 'installed';
    }
  } catch (error) {
    log.error(error);
  }

  return nvmInfo;
}

export default getLocalNodeInfo;
