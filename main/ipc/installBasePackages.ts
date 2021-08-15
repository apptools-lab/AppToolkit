import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { PackageInfo } from '../types';
import { send as sendMainWindow } from '../window';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import log from '../utils/log';
import nodeCache from '../utils/nodeCache';
import store, { packagesDataKey } from '../store';
import { record } from '../recorder';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('install-base-packages', (
    event: IpcMainInvokeEvent,
    { packagesList, installChannel, processChannel }: { packagesList: PackageInfo[]; installChannel: string; processChannel: string },
  ) => {
    let childProcess = childProcessMap.get(installChannel);
    if (childProcess) {
      log.info(`Channel ${installChannel} has an existed child process.`);
      return;
    }
    // fork a child process to install package
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageManager/index'));
    childProcessMap.set(installChannel, childProcess);
    // After packing the Electron app, the electron module which the electron-store require, couldn't be found in childProcess.
    // For more detail, see this PR: https://github.com/appworks-lab/toolkit/pull/41
    const packagesData = store.get(packagesDataKey);
    childProcess.send({ packagesList, packagesData, installChannel, processChannel });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        if (data.status === 'done') {
          killChannelChildProcess(childProcessMap, installChannel);
          record({
            module: 'base',
            action: 'installPackages',
          });
        }
        // save process data to cache
        const processCaches = nodeCache.get(channel) || [];
        const taskIndex = processCaches.findIndex((item) => item.currentIndex === data.currentIndex);
        if (taskIndex > -1) {
          // update the existed task process in cache
          processCaches.splice(taskIndex, 1, data);
        } else {
          // add task process to cache
          processCaches.push(data);
        }
        nodeCache.set(channel, processCaches);
      }

      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-install-base-packages', (event: IpcMainInvokeEvent, installChannel: string) => {
    killChannelChildProcess(childProcessMap, installChannel);
  });

  ipcMain.handle('get-base-packages-install-cache', (event: IpcMainInvokeEvent, { installChannel, processChannel }) => {
    const processCaches = nodeCache.get(processChannel);
    const installLogCaches = nodeCache.get(installChannel);

    return { processCaches, installLogCaches };
  });

  ipcMain.handle('clear-base-packages-install-cache', (event: IpcMainInvokeEvent, { installChannel, processChannel }) => {
    clearCache([installChannel, processChannel]);
  });
};

function clearCache(cachesId: string[]) {
  if (Array.isArray(cachesId)) {
    cachesId.forEach((cacheId: string) => {
      nodeCache.set(cacheId, undefined);
    });
  }
}
