import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import { IBasePackageInfo } from '../../types';
import getVSCodeExtensionInfo from './vscodeExtension';

const processor = {
  VSCode: getVSCodeExtensionInfo,
};

export default async (basePackageInfo: IBasePackageInfo) => {
  const { name, options: { IDEType } } = basePackageInfo;

  const getIDEExtensionInfoFunc = processor[IDEType];
  if (getIDEExtensionInfoFunc) {
    return await getVSCodeExtensionInfo(name);
  }
  return DEFAULT_LOCAL_PACKAGE_INFO;
};
