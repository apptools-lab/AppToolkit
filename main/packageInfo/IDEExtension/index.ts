import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import { BasePackageInfo } from '../../types';
import getVSCodeExtensionInfo from './vscode';

const processor = {
  VSCode: getVSCodeExtensionInfo,
};

export default async (basePackageInfo: BasePackageInfo) => {
  const { name, options: { IDEType } } = basePackageInfo;

  const getIDEExtensionInfoFunc = processor[IDEType];
  if (getIDEExtensionInfoFunc) {
    return await getIDEExtensionInfoFunc(name);
  }
  return DEFAULT_LOCAL_PACKAGE_INFO;
};
