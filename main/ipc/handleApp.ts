import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { getPackageInfo } from '../packageInfo';
import store, { packagesDataKey } from '../store';
import { PackagesData, AppInfo, Platform, PackageInfo } from '../types';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import log from '../utils/log';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import { record } from '../recorder';
import { sendToMainWindow } from '../window';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('get-apps-info', async () => {
    const data: PackagesData = store.get(packagesDataKey);
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

    const result = [];
    for (const appInfo of appsInfo) {
      const { packages } = appInfo;
      const newPackages = await Promise.all(packages.map((item) => {
        return getPackageInfo(item);
      }));
      result.push({ ...appInfo, packages: newPackages });
    }

    return result;
  });

  ipcMain.handle('uninstall-app', (
    e: IpcMainInvokeEvent,
    { packageInfo, uninstallChannel, processChannel }: { packageInfo: PackageInfo; uninstallChannel: string; processChannel: string },
  ) => {
    const childProcessName = `${uninstallChannel}-${packageInfo.id}`;
    let childProcess = childProcessMap.get(childProcessName);
    if (childProcess) {
      log.info(`Channel ${childProcessName} has an existed child process.`);
      return;
    }
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageManager/index'));
    childProcessMap.set(childProcessName, childProcess);
    const packagesData = store.get(packagesDataKey);
    childProcess.send({ packagesList: [packageInfo], packagesData, uninstallChannel, processChannel, type: 'uninstall' });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        switch (data.status) {
          case 'done':
            record({
              module: 'app',
              action: 'uninstall',
              data: {
                name: packageInfo.title,
              },
            });
          // eslint-disable-next-line no-fallthrough
          case 'error':
            killChannelChildProcess(childProcessMap, childProcessName);
            break;
          default:
            break;
        }
      }

      sendToMainWindow(channel, data);
    });
  });

  ipcMain.handle('install-app', (
    e: IpcMainInvokeEvent,
    { packageInfo, installChannel, processChannel }: { packageInfo: PackageInfo; installChannel: string; processChannel: string },
  ) => {
    const childProcessName = `${installChannel}-${packageInfo.id}`;
    let childProcess = childProcessMap.get(childProcessName);
    if (childProcess) {
      log.info(`Channel ${childProcessName} has an existed child process.`);
      return;
    }
    /**
     * we need to cancel the install process
     * so we create a childProcess and we can kill it later
     */
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageManager/index'));
    childProcessMap.set(childProcessName, childProcess);
    const packagesData = store.get(packagesDataKey);
    childProcess.send({ packagesList: [packageInfo], packagesData, installChannel, processChannel });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        switch (data.status) {
          case 'done':
            record({
              module: 'app',
              action: 'install',
              data: {
                name: packageInfo.title,
              },
            });
          // eslint-disable-next-line no-fallthrough
          case 'error':
            killChannelChildProcess(childProcessMap, childProcessName);
            break;
          default:
            break;
        }
      }

      sendToMainWindow(channel, data);
    });
  });
};
