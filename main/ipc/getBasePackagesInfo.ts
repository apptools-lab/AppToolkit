import { ipcMain } from 'electron';
import { IBasePackageInfo, Platform } from '../types';
import { getPackageInfo } from '../packageInfo';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import store, { packagesDataKey } from '../store';

export default () => {
  ipcMain.handle('get-base-packages-info', async () => {
    const data = store.get(packagesDataKey);
    const { bases = [] }: { bases: IBasePackageInfo[] } = data;
    const isAliInternal = await checkIsAliInternal();
    const basePackages = bases.filter(({ isInternal, platforms }) => {
      // 1. only return the package info in current platform
      // 2. remove internal package when not in the ali internal
      return platforms.includes(process.platform as Platform) && (isInternal ? isAliInternal : true);
    });
    const packagesData = await Promise.all(basePackages.map((basePackageInfo: IBasePackageInfo) => {
      return getPackageInfo(basePackageInfo);
    }));
    return packagesData;
  });
};
