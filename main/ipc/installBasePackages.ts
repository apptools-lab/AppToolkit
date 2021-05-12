import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { send as sendMainWindow } from '../window';
import { IPackageInfo } from '../types';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('install-base-packages', async (
    event: IpcMainInvokeEvent,
    { packagesList, installChannel, processChannel }: { packagesList: IPackageInfo[]; installChannel: string; processChannel: string },
  ) => {
    let childProcess = childProcessMap.get(installChannel);
    if (childProcess) {
      console.log(`Channel ${installChannel} has an existed child process.`);
    } else {
    // fork a child process to install package
      childProcess = child_process.fork(path.join(__dirname, '..', 'packageInstaller/index'));
      childProcessMap.set(installChannel, childProcess);
    }

    childProcess.send({ packagesList, installChannel, processChannel });
    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel && (data.status === 'success' || data.status === 'fail')) {
        killChannelChildProcess(childProcessMap, installChannel);
      }
      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-install-base-packages', async (event: IpcMainInvokeEvent, installChannel: string) => {
    killChannelChildProcess(childProcessMap, installChannel);
  });
};

function killChannelChildProcess(
  channelChildProcessMap: Map<string, child_process.ChildProcess>,
  channel: string,
) {
  const childProcess = channelChildProcessMap.get(channel);
  if (childProcess && childProcess.kill instanceof Function) {
    // kill child process
    childProcess.kill();
    channelChildProcessMap.delete(channel);
  }
}
