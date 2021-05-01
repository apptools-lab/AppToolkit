import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import * as fse from 'fs-extra';
import { IBasicPackageInfo, IPackageInfo } from './types';
import getLocalInfo from './getLocalInfo';
import { send as sendMainWindow } from './window';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('get-base-packages-info', async () => {
    // TODO: get data.json from OSS and save it in the storage when app starts first
    const data = await fse.readJSON(path.join(__dirname, 'data.json'));
    const { bases = [] }: { bases: IBasicPackageInfo[] } = data;
    const packagesData = bases.map((basicPackageInfo: IBasicPackageInfo) => {
      return getLocalInfo(basicPackageInfo);
    });

    return packagesData;
  });

  ipcMain.handle('install-base-package', async (
    event: IpcMainInvokeEvent,
    { packagesList, installChannel, processChannel }: { packagesList: IPackageInfo[]; installChannel: string; processChannel: string },
  ) => {
    if (childProcessMap.get(installChannel)) {
      // TODO show warning
      return;
    }
    // fork a child process to install package
    const childProcess = child_process.fork(path.join(__dirname, 'installPackage/index'));
    childProcessMap.set(installChannel, childProcess);
    childProcess.send({ packagesList, installChannel, processChannel });
    childProcess.on('message', ({ channel, data }: any) => {
      if (channel === processChannel && (data.status === 'success' || data.status === 'fail')) {
        killChannelChildProcess(childProcessMap, installChannel);
      }
      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-install-base-package', async (event: IpcMainInvokeEvent, installChannel: string) => {
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
