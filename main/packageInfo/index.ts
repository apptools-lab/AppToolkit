import { DEFAULT_LOCAL_PACKAGE_INFO } from '../constants';
import { IBasePackageInfo, ILocalPackageInfo, IPackageInfo } from '../types';
import log from '../utils/log';
import getLocalCliInfo from './cli';
import getLocalDmgInfo from './dmg';
import getIDEExtensionInfo from './IDEExtension';

const getLocalInfoProcessor = {
  dmg: getLocalDmgInfo,
  cli: getLocalCliInfo,
  IDEExtension: getIDEExtensionInfo,
};

export function getLocalInfo(packageInfo: IBasePackageInfo): IPackageInfo {
  const { type } = packageInfo;
  const getLocalInfoFunc = getLocalInfoProcessor[type];
  const ret = { ...packageInfo, ...DEFAULT_LOCAL_PACKAGE_INFO };

  if (getLocalInfoFunc) {
    try {
      const localPackageInfo: ILocalPackageInfo = getLocalInfoFunc(packageInfo);
      return { ...ret, ...localPackageInfo };
    } catch (error) {
      log.error(error.message);
    }
  }

  return ret;
}
