import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IBasePackageInfo } from './types';
import getLocalNodeInfo from './utils/getLocalNodeInfo';
import getLocalAppInfo from './utils/getLocalAppInfo';
import getLocalToolInfo from './utils/getLocalToolInfo';
import installPackage from './utils/installPackage';

const getInfoFuncMap = {
  app: ({ name, version }: IBasePackageInfo) => getLocalAppInfo(name, version),
  tool: ({ name, version }: IBasePackageInfo) => getLocalToolInfo(name, version),
  node: ({ name, managerName, version }: IBasePackageInfo) => getLocalNodeInfo(name, managerName, version),
};

export default () => {
  ipcMain.handle('getBasePackages', async () => {
    // TODO: get data.json from OSS
    const data = await fse.readJSON(path.join(__dirname, 'data.json'));
    const { bases } = data;
    const newBaseData = bases.map((basePackageInfo: IBasePackageInfo) => {
      const getInfoFunc = getInfoFuncMap[basePackageInfo.type];
      if (getInfoFunc) {
        const info = getInfoFunc(basePackageInfo);
        return { ...basePackageInfo, ...info };
      }
      return { ...basePackageInfo };
    });
    console.log('newBaseData:', newBaseData);
    return newBaseData;
  });

  ipcMain.handle('installPackage', async (event: IpcMainInvokeEvent, packageInfo: IBasePackageInfo) => {
    await installPackage(packageInfo);
  });
};
