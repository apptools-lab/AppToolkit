import * as child_process from 'child_process';
import { ipcMain } from 'electron';
import * as path from 'path';
import { IpcMainInvokeEvent } from 'electron/main';
import store, { packagesDataKey } from '../store';
import { IDEExtension, PackagesData, Platform, PackageInfo } from '../types';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import { getPackageInfo } from '../packageInfo';
import log from '../utils/log';
import { send as sendMainWindow } from '../window';
import { record } from '../recorder';
import killChannelChildProcess from '../utils/killChannelChildProcess';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('get-IDE-extensions-info', async () => {
    const data: PackagesData = store.get(packagesDataKey);
    const { IDEExtensions = [] } = data;
    const isAliInternal = await checkIsAliInternal();

    // 1. only return the extension info in current platform
    // 2. remove internal extension when not in the ali internal
    const IDEExtensionsInfo = IDEExtensions.map((item: IDEExtension) => {
      const { extensions = [] } = item;
      const filterExtensions = extensions.filter(({ isInternal, platforms }) => {
        return platforms.includes(process.platform as Platform) && (isInternal ? isAliInternal : true);
      });

      return {
        ...item,
        extensions: filterExtensions,
      };
    });

    const result = [];
    for (const IDEExtensionInfo of IDEExtensionsInfo) {
      const { extensions } = IDEExtensionInfo;
      const newExtensions = await Promise.all(extensions.map((item) => {
        return getPackageInfo(item);
      }));
      result.push({ ...IDEExtensionInfo, extensions: newExtensions });
    }

    return result;
  });

  ipcMain.handle('install-IDE-extension', (
    e: IpcMainInvokeEvent,
    { packageInfo, installChannel, processChannel }: { packageInfo: PackageInfo; installChannel: string; processChannel: string },
  ) => {
    const childProcessName = `${installChannel}-${packageInfo.name}`;
    let childProcess = childProcessMap.get(childProcessName);
    if (childProcess) {
      log.info(`Channel ${childProcessName} has an existed child process.`);
      return;
    }
    // fork a child process to install package
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageManager/index'));
    childProcessMap.set(childProcessName, childProcess);
    const packagesData = store.get(packagesDataKey);
    childProcess.send({ packagesList: [packageInfo], packagesData, installChannel, processChannel });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        if (data.status === 'done') {
          record({
            module: 'IDEExtension',
            action: 'install',
            data: {
              name: packageInfo.name,
            },
          });
        }
        if (data.status === 'done' || data.status === 'error') {
          killChannelChildProcess(childProcessMap, childProcessName);
        }
      }

      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('uninstall-IDE-extension', (
    e: IpcMainInvokeEvent,
    { packageInfo, uninstallChannel, processChannel }: { packageInfo: PackageInfo; uninstallChannel: string; processChannel: string },
  ) => {
    const childProcessName = `${uninstallChannel}-${packageInfo.name}`;
    let childProcess = childProcessMap.get(childProcessName);
    if (childProcess) {
      log.info(`Channel ${childProcessName} has an existed child process.`);
      return;
    }
    // fork a child process to install package
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageManager/index'));
    childProcessMap.set(childProcessName, childProcess);
    const packagesData = store.get(packagesDataKey);
    childProcess.send({ packagesList: [packageInfo], packagesData, uninstallChannel, processChannel, type: 'uninstall' });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        if (data.status === 'done') {
          record({
            module: 'IDEExtension',
            action: 'uninstall',
            data: {
              name: packageInfo.name,
            },
          });
        }
        if (data.status === 'done' || data.status === 'error') {
          killChannelChildProcess(childProcessMap, childProcessName);
        }
      }

      sendMainWindow(channel, data);
    });
  });
};

