import * as path from 'path';
import * as fse from 'fs-extra';
import { ipcMain } from 'electron';
import { IBasePackageInfo } from '../types';
import { getLocalInfo } from '../packageInfo';

export default () => {
  ipcMain.handle('get-base-packages-info', async () => {
  // TODO: get data.json from OSS and save it in the storage when app starts first
    const data = await fse.readJSON(path.join(__dirname, '../data', 'data.json'));
    const { bases = [] }: { bases: IBasePackageInfo[] } = data;
    const packagesData = bases.map((basePackageInfo: IBasePackageInfo) => {
      return getLocalInfo(basePackageInfo);
    });

    return packagesData;
  });
};
