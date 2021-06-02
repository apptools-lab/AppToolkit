import * as path from 'path';
import * as child_process from 'child_process';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { send as sendMainWindow } from '../window';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import nodeCache from '../utils/nodeCache';
import log from '../utils/log';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('install-node', (
    event: IpcMainInvokeEvent,
    {
      managerName,
      nodeVersion,
      reinstallGlobalDeps,
      installChannel,
      processChannel,
    }: {
      managerName: string;
      nodeVersion: string;
      reinstallGlobalDeps: boolean;
      installChannel: string;
      processChannel: string;
    },
  ) => {
    let childProcess = childProcessMap.get(installChannel);
    if (childProcess) {
      log.info(`Channel ${installChannel} has an existed child process.`);
      return;
    }
    // first, clear the cache
    clearCache([installChannel, processChannel]);

    childProcess = child_process.fork(path.join(__dirname, '..', 'node/index'));
    childProcessMap.set(installChannel, childProcess);

    childProcess.send({
      managerName,
      nodeVersion,
      reinstallGlobalDeps,
      installChannel,
      processChannel,
    });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        const { status, result } = data;
        if (status === 'done') {
          killChannelChildProcess(childProcessMap, installChannel);
        } else if (status === 'success' && result && result.nodePath) {
          // nodeEnvPath e.g: /Users/xxx/.nvm/versions/node/v14.15.0/bin/path -> Users/xxx/.nvm/versions/node/v14.15.0/bin
          const nodeEnvPath = result.nodePath.replace('/bin/node', '/bin');
          // process.env.PATH: /usr/local/bin -> /Users/xxx/.nvm/versions/node/v14.15.0/bin:/usr/local/bin
          process.env.PATH = `${nodeEnvPath}${path.delimiter}${process.env.PATH}`;
        }
        // save data to cache
        const processCaches = nodeCache.get(channel) || [];
        const taskIndex = processCaches.findIndex((item) => item.task === data.task);
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

  ipcMain.handle('cancel-install-node', (event: IpcMainInvokeEvent, installChannel: string) => {
    killChannelChildProcess(childProcessMap, installChannel);
  });

  ipcMain.handle('get-node-install-cache', (event: IpcMainInvokeEvent, { installChannel, processChannel }) => {
    const processCaches = nodeCache.get(processChannel);
    const installLogCaches = nodeCache.get(installChannel);

    return { processCaches, installLogCaches };
  });

  ipcMain.handle('clear-node-install-cache', (event: IpcMainInvokeEvent, { installChannel, processChannel }) => {
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
