import { DEFAULT_LOCAL_PACKAGE_INFO } from '../constants';
import { BasePackageInfo, LocalPackageInfo, PackageInfo } from '../types';
import log from '../utils/log';
import getLocalCliInfo from './cli';
import getLocalDmgInfo from './dmg';
import getIDEExtensionInfo from './IDEExtension';
import getBrowserExtensionInfo from './browserExtension';
import getNpmDependencyInfo from './npmDependency';

const getLocalInfoProcessor = {
  dmg: getLocalDmgInfo,
  cli: getLocalCliInfo,
  IDEExtension: getIDEExtensionInfo,
  browserExtension: getBrowserExtensionInfo,
  npmDependency: getNpmDependencyInfo,
};

export async function getPackageInfo(packageInfo: BasePackageInfo): Promise<PackageInfo> {
  const { type } = packageInfo;
  const getLocalInfoFunc = getLocalInfoProcessor[type];
  const ret = { ...packageInfo, ...DEFAULT_LOCAL_PACKAGE_INFO };

  if (getLocalInfoFunc) {
    try {
      const localPackageInfo: LocalPackageInfo = await getLocalInfoFunc(packageInfo);
      return { ...ret, ...localPackageInfo };
    } catch (error) {
      log.error(error);
    }
  }

  return ret;
}
