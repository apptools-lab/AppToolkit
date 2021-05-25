import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import { IBasePackageInfo } from '../../types';
import getVSCodeExtensionInfo from './vscodeExtension';

const processor = {
  VSCode: getVSCodeExtensionInfo,
};

export default (basePackageInfo: IBasePackageInfo) => {
  const { name, options: { IDEType } } = basePackageInfo;

  const getIDEExtensionInfoFunc = processor[IDEType];
  if (getIDEExtensionInfoFunc) {
    return getVSCodeExtensionInfo(name);
  }
  return DEFAULT_LOCAL_PACKAGE_INFO;
};
