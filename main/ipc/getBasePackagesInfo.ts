import { ipcMain } from 'electron';
import { BasePackageInfo, Platform } from '../types';
import { getPackageInfo } from '../packageInfo';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import store, { packagesDataKey } from '../store';

export default () => {
  ipcMain.handle('get-base-packages-info', async () => {
    const data = store.get(packagesDataKey);
    const { bases = [] }: { bases: BasePackageInfo[] } = data;
    const isAliInternal = await checkIsAliInternal();
    const basePackages = bases.filter(({ isInternal, platforms, options = {} }) => {
      // 1. only return the package info in current platform
      // 2. remove internal package when not in the ali internal
      let shouldDisplayInCurEnv = isInternal ? isAliInternal : true;
      if (options.onlyInCurEnv) {
        // only display in current env
        shouldDisplayInCurEnv = isAliInternal === isInternal;
      }
      return platforms.includes(process.platform as Platform) && shouldDisplayInCurEnv;
    });
    const packagesData = await Promise.all(basePackages.map((basePackageInfo: BasePackageInfo) => {
      return getPackageInfo(basePackageInfo);
    }));
    return packagesData;
  });
};
