import { IBasicPackageInfo } from '../types';
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
    const localPackageInfo = getLocalInfoFunc(packageInfo);
    return { ...packageInfo, ...localPackageInfo };
  }
  return {};
}

export default getLocalInfo;
