import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import { BasePackageInfo } from '../../types';
import getChromeExtensionInfo from './chrome';

const processor = {
  Chrome: getChromeExtensionInfo,
};

export default async (basePackageInfo: BasePackageInfo) => {
  const { options: { browserType } } = basePackageInfo;

  const getBrowserExtensionInfoFunc = processor[browserType];
  if (getBrowserExtensionInfoFunc) {
    return await getBrowserExtensionInfoFunc(basePackageInfo);
  }
  return DEFAULT_LOCAL_PACKAGE_INFO;
};
