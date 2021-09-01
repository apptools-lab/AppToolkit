import { BasePackageInfo } from '../../types';
import getLocalNodeInfo from './node';
import getLocalCliInfo from './cli';

const processor = {
  node: getLocalNodeInfo,
};

export default async (basePackageInfo: BasePackageInfo) => {
  const { id, version, options } = basePackageInfo;
  const getLocalInfoFunc = processor[id];

  return getLocalInfoFunc ? await getLocalInfoFunc(id, version, options) : await getLocalCliInfo(id, version);
};
