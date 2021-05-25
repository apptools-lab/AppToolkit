import * as path from 'path';
import * as fse from 'fs-extra';
import { ipcMain } from 'electron';
import { IBasePackageInfo } from '../types';
import { getPackageInfo } from '../packageInfo';
import checkIsAliInternal from '../utils/checkIsAliInternal';

export default () => {
  ipcMain.handle('get-base-packages-info', async () => {
    // TODO: get data.json from OSS and save it in the storage when app starts first
    const data = await fse.readJSON(path.join(__dirname, '../data', 'data.json'));
    const { bases = [] }: { bases: IBasePackageInfo[] } = data;
    const isAliInternal = await checkIsAliInternal();
    const basePackages = bases.filter((item) => {
      // remove internal package when not in the ali internal
      return item.isInternal ? isAliInternal : true;
    });
    const packagesData = basePackages.map((basePackageInfo: IBasePackageInfo) => {
      return getPackageInfo(basePackageInfo);
    });

    return packagesData;
  });
};
