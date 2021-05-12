import { IBasePackageInfo } from '../../types';
import getLocalNodeInfo from './node';
import getLocalToolInfo from './tool';

const processor = {
  node: getLocalNodeInfo,
};

function getLocalCmdInfo(basePackageInfo: IBasePackageInfo) {
  const { name, version, options } = basePackageInfo;
  const getLocalInfoFunc = processor[name];
  if (getLocalInfoFunc) {
    return getLocalInfoFunc(name, version, options);
  }
  return getLocalToolInfo(name, version);
}

export default getLocalCmdInfo;
