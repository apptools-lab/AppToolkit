import { IBasicPackageInfo } from '../../types';
import getLocalNodeInfo from './node';
import getLocalToolInfo from './tool';

const processor = {
  node: getLocalNodeInfo,
};

function getLocalCmdInfo(basicPackageInfo: IBasicPackageInfo) {
  const { name, version, options } = basicPackageInfo;
  const getLocalInfoFunc = processor[name];
  if (getLocalInfoFunc) {
    return getLocalInfoFunc(name, version, options);
  }
  return getLocalToolInfo(name, version);
}

export default getLocalCmdInfo;
