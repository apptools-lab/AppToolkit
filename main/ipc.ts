import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IBasicPackageInfo, IPackageInfo } from './types';
import { getLocalCmdInfo, getLocalDmgInfo } from './getLocalInfo';
import installPackage from './utils/installPackage';

const getLocalInfoFuncMap = {
  dmg: getLocalDmgInfo,
  cmd: getLocalCmdInfo,
};

export default () => {
  ipcMain.handle('get-base-packages', async () => {
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

    return packagesData;
  });

  ipcMain.handle('install-package', async (event: IpcMainInvokeEvent, packageInfo: IPackageInfo, channel: string) => {
    await installPackage(packageInfo, channel);
  });
};
