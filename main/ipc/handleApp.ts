import { ipcMain } from 'electron';
import { getPackageInfo } from '../packageInfo';
import store, { packagesDataKey } from '../store';
import { PackageData, AppInfo, Platform } from '../types';
import checkIsAliInternal from '../utils/checkIsAliInternal';

export default () => {
  ipcMain.handle('get-apps-info', async () => {
    const data: PackageData = store.get(packagesDataKey);
    const { apps = [] } = data;
    const isAliInternal = await checkIsAliInternal();

    const appsInfo = apps.map((app: AppInfo) => {
      const { packages = [] } = app;
      // 1. only return the package info in current platform
      // 2. remove internal package when not in the ali internal
      const filterPackages = packages.filter(({ isInternal, platforms }) => {
        return platforms.includes(process.platform as Platform) && (isInternal ? isAliInternal : true);
      });
      return {
        ...app,
        packages: filterPackages,
      };
    });

    const infos = await Promise.all(appsInfo.map((appInfo) => {
      const { packages } = appInfo;
      return Promise.all(packages.map((item) => {
        return getPackageInfo(item);
      })).then((newPackages) => {
        return {
          ...appInfo,
          packages: newPackages,
        };
      });
    }));

    return infos;
  });

  ipcMain.handle('install-app', () => {

  });

  ipcMain.handle('uninstall-app', () => {

  });
};
