import * as path from 'path';
import * as child_process from 'child_process';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { send as sendMainWindow } from '../window';
import killChannelChildProcess from '../utils/killChannelChildProcess';

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
    const childProcess = child_process.fork(path.join(__dirname, '..', 'node/index'));
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
          process.env.PATH = `${result.nodePath.replace('/bin/node', '/bin')}${path.delimiter}${process.env.PATH}`;
        }
      }
      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-install-node', (event: IpcMainInvokeEvent, installChannel: string) => {
    killChannelChildProcess(childProcessMap, installChannel);
  });
};
