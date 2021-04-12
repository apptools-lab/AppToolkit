import { ipcMain } from 'electron';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IBaseEnv } from 'types';
import getAppInfo from './utils/getAppInfo';
import getToolInfo from './utils/getToolInfo';

const handleGetInfoFuncObj = {
  app: getAppInfo,
  tool: getToolInfo,
};

export default () => {
  ipcMain.handle('getBaseApp', async () => {
    const data = await fse.readJSON(path.join(__dirname, 'data.json'));
    const { base } = data;
    const newBaseData = base.map((item: IBaseEnv) => {
      const handleGetInfoFunc = handleGetInfoFuncObj[item.type];
      const info = handleGetInfoFunc(item.name);
      return { ...item, ...info };
    });
    return newBaseData;
  });
};
