import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IBasicPackageInfo, IPackageInfo } from './types';
import getLocalCmdInfo from './utils/getLocalCmdInfo';
import getLocalDmgInfo from './utils/getLocalDmgInfo';
import installPackage from './utils/installPackage';
import log from './utils/log';

const getLocalInfoFuncMap = {
  dmg: getLocalDmgInfo,
  cmd: getLocalCmdInfo,
};

export default () => {
  ipcMain.handle('getBasePackages', async () => {
    // TODO: get data.json from OSS and save it in the storage
    const data = await fse.readJSON(path.join(__dirname, 'data.json'));
    const { bases }: { bases: IBasicPackageInfo[] } = data;
    const packagesData = bases.map((basePackageInfo: IBasicPackageInfo) => {
      const getLocalInfoFunc = getLocalInfoFuncMap[basePackageInfo.type];
      if (getLocalInfoFunc) {
        const localPackageInfo = getLocalInfoFunc(basePackageInfo);
        return { ...basePackageInfo, ...localPackageInfo };
      }
      return basePackageInfo;
    });
    log.info('newBaseData:', packagesData);
    return packagesData;
  });

  ipcMain.handle('installPackage', async (event: IpcMainInvokeEvent, packageInfo: IPackageInfo) => {
    await installPackage(packageInfo);
  });
};
