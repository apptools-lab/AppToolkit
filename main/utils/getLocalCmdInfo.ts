import { IBasicPackageInfo } from '../types';
import getLocalNodeInfo from './getLocalNodeInfo';
import getLocalToolInfo from './getLocalToolInfo';

function getLocalCmdInfo(basicPackageInfo: IBasicPackageInfo) {
  const { name, version, options } = basicPackageInfo;
  if (name === 'node') {
    return getLocalNodeInfo(name, version, options);
  } else {
    return getLocalToolInfo(name, version);
  }
}

export default getLocalCmdInfo;
