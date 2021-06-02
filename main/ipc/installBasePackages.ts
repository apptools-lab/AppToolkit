import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { IPackageInfo } from '../types';
import { send as sendMainWindow } from '../window';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import log from '../utils/log';
import nodeCache from '../utils/nodeCache';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('install-base-packages', (
    event: IpcMainInvokeEvent,
    { packagesList, installChannel, processChannel }: { packagesList: IPackageInfo[]; installChannel: string; processChannel: string },
  ) => {
    let childProcess = childProcessMap.get(installChannel);
    if (childProcess) {
      log.info(`Channel ${installChannel} has an existed child process.`);
      return;
    }
    // first, clear the cache
    clearCache([installChannel, processChannel]);
    // fork a child process to install package
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageInstaller/index'));
    childProcessMap.set(installChannel, childProcess);

    childProcess.send({ packagesList, installChannel, processChannel });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel && data.status === 'done') {
        killChannelChildProcess(childProcessMap, installChannel);
      }
      // save data to cache
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
