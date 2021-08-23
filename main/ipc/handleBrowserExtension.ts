import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import store, { packagesDataKey } from '../store';
import { BrowserExtensionInfo, PackagesData, Platform, PackageInfo } from '../types';
import checkIsAliInternal from '../utils/checkIsAliInternal';
import { getPackageInfo } from '../packageInfo';
import log from '../utils/log';
import { record } from '../recorder';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import { send as sendMainWindow } from '../window';
import ping = require('ping');

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('get-browser-extensions-info', async () => {
    const data: PackagesData = store.get(packagesDataKey);
    const { browserExtensions = [] } = data;
    const isAliInternal = await checkIsAliInternal();

    // 1. only return the extension info in current platform
    // 2. remove internal extension when not in the ali internal
    const browserExtensionsInfo = browserExtensions.map((item: BrowserExtensionInfo) => {
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
    for (const browserExtensionInfo of browserExtensionsInfo) {
      const { extensions } = browserExtensionInfo;
      const newExtensions = await Promise.all(extensions.map((item) => {
        return getPackageInfo(item);
      }));
      result.push({ ...browserExtensionInfo, extensions: newExtensions });
    }

    return result;
  });

  ipcMain.handle('install-browser-extension', async (
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
            module: 'browserExtension',
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

  ipcMain.handle('check-webstore-host-alive', async (e: IpcMainInvokeEvent, browserType: string) => {
    const browserHosts = {
      Chrome: 'chrome.google.com',
    };
    if (browserHosts[browserType]) {
      const { alive } = await ping.promise.probe(browserHosts[browserType]);
      return alive;
    }
    // default download extension
    return false;
  });
};
