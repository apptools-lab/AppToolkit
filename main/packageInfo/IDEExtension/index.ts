import { DEFAULT_LOCAL_PACKAGE_INFO } from '../../constants';
import { BasePackageInfo } from '../../types';
import getVSCodeExtensionInfo from './vscode';

const processor = {
  VSCode: getVSCodeExtensionInfo,
};

export default async (basePackageInfo: BasePackageInfo) => {
  const { id, options: { IDEType } } = basePackageInfo;

  const getIDEExtensionInfoFunc = processor[IDEType];
  if (getIDEExtensionInfoFunc) {
    return await getIDEExtensionInfoFunc(id);
  }
  return DEFAULT_LOCAL_PACKAGE_INFO;
};
