import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { IPackageInfo } from '../types';
import { send as sendMainWindow } from '../window';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import log from '../utils/log';

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
    // fork a child process to install package
    childProcess = child_process.fork(path.join(__dirname, '..', 'packageInstaller/index'));
    childProcessMap.set(installChannel, childProcess);

    childProcess.send({ packagesList, installChannel, processChannel });

    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel && data.status === 'done') {
        killChannelChildProcess(childProcessMap, installChannel);
      }

      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-install-base-packages', (event: IpcMainInvokeEvent, installChannel: string) => {
    killChannelChildProcess(childProcessMap, installChannel);
  });
};
