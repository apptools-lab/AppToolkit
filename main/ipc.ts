import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IBasePackage } from 'types';
import getAppInfo from './utils/getAppInfo';
import getToolInfo from './utils/getToolInfo';
import installPackage from './utils/installPackage';

const getInfoFuncMap = {
  app: getAppInfo,
  tool: getToolInfo,
};

export default () => {
  ipcMain.handle('getBasePackage', async () => {
    // TODO: get data.json from OSS
    const data = await fse.readJSON(path.join(__dirname, 'data.json'));
    const { base } = data;
    const newBaseData = base.map((item: IBasePackage) => {
      const getInfoFunc = getInfoFuncMap[item.type];
      if (getInfoFunc) {
        const info = getInfoFunc(item.name, item.version);
        return { ...item, ...info };
      }
      return { ...item };
    });
    return newBaseData;
  });

  ipcMain.handle('installPackage', async (event: IpcMainInvokeEvent, packageInfo: IBasePackage) => {
    const { downloadUrl } = packageInfo;
    await installPackage(downloadUrl);
  });
};
