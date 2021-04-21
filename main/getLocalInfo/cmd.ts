import { IBasicPackageInfo } from '../types';
import getLocalNodeInfo from './node';
import getLocalToolInfo from './tool';

function getLocalCmdInfo(basicPackageInfo: IBasicPackageInfo) {
  const { name, version, options } = basicPackageInfo;
  if (name === 'node') {
    return getLocalNodeInfo(name, version, options);
  } else {
    return getLocalToolInfo(name, version);
  }
}

export default getLocalCmdInfo;
