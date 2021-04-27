import { IBasicPackageInfo } from '../types';
import log from '../utils/log';
import getLocalCmdInfo from './cmd';
import getLocalDmgInfo from './dmg';

const getLocalInfoProcessor = {
  dmg: getLocalDmgInfo,
  cmd: getLocalCmdInfo,
};

function getLocalInfo(packageInfo: IBasicPackageInfo) {
  const { type } = packageInfo;
  const getLocalInfoFunc = getLocalInfoProcessor[type];
  if (getLocalInfoFunc) {
    try {
      const localPackageInfo = getLocalInfoFunc(packageInfo);
      return { ...packageInfo, ...localPackageInfo };
    } catch (error) {
      log.error(error.message);
    }
  }
  return packageInfo;
}

export default getLocalInfo;
