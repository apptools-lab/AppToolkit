import { IBasePackageInfo } from '../../types';
import getLocalNodeInfo from './node';
import getLocalCliInfo from './cli';

const processor = {
  node: getLocalNodeInfo,
};

export default (basePackageInfo: IBasePackageInfo) => {
  const { name, version, options } = basePackageInfo;
  const getLocalInfoFunc = processor[name];
  if (getLocalInfoFunc) {
    return getLocalInfoFunc(name, version, options);
  }
  return getLocalCliInfo(name, version);
};
