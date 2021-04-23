import { IBasicPackageInfo } from '../types';
import getLocalCmdInfo from './cmd';
import getLocalDmgInfo from './dmg';
import log from '../utils/log';

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
