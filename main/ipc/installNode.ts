import * as path from 'path';
import * as child_process from 'child_process';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { sendToMainWindow } from '../window';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import nodeCache from '../utils/nodeCache';
import log from '../utils/log';
import { record } from '../recorder';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('install-node', (
    event: IpcMainInvokeEvent,
    {
      managerName,
      nodeVersion,
      installChannel,
      processChannel,
    }: {
      managerName: string;
      nodeVersion: string;
      installChannel: string;
      processChannel: string;
    },
  ) => {
    let childProcess = childProcessMap.get(installChannel);
    if (childProcess) {
      log.info(`Channel ${installChannel} has an existed child process.`);
      return;
    }
    /**
     * we need to cancel the install node process
     * so we create a childProcess and we can kill it later
     */
    childProcess = child_process.fork(path.join(__dirname, '..', 'node/index'));
    childProcessMap.set(installChannel, childProcess);

    childProcess.send({
      managerName,
      nodeVersion,
      installChannel,
      processChannel,
    });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel) {
        const { status, result } = data;
        if (status === 'done') {
          killChannelChildProcess(childProcessMap, installChannel);
          record({
            module: 'node',
            action: 'installNode',
            data: {
              version: nodeVersion,
              nodeManager: managerName,
            },
          });
        } else if (status === 'success' && result && result.nodePath) {
          // nodeEnvPath e.g: /Users/xxx/.nvm/versions/node/v14.15.0/bin/node -> Users/xxx/.nvm/versions/node/v14.15.0/bin
          const nodeEnvPath = result.nodePath.replace('/bin/node', '/bin');
          // process.env.PATH: /usr/local/bin -> /Users/xxx/.nvm/versions/node/v14.15.0/bin:/usr/local/bin
          process.env.PATH = `${nodeEnvPath}${path.delimiter}${process.env.PATH}`;
        } else if (status === 'error') {
          killChannelChildProcess(childProcessMap, installChannel);
        }
        // save process data to cache
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

      sendToMainWindow(channel, data);
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
