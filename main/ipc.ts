import { ipcMain } from 'electron';
import * as child_process from 'child_process';
import { IpcMainInvokeEvent } from 'electron/main';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IBasicPackageInfo, IPackageInfo } from './types';
import getLocalInfo from './getLocalInfo';
import { send as sendMainWindow } from './window';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('get-base-packages', async () => {
    // TODO: get data.json from OSS and save it in the storage
    const data = await fse.readJSON(path.join(__dirname, 'data.json'));
    const { bases }: { bases: IBasicPackageInfo[] } = data;
    const packagesData = bases.map((basePackageInfo: IBasicPackageInfo) => {
      return getLocalInfo(basePackageInfo);
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
      if (channel === processChannel && data.status === 'success') {
        childProcessMap.set(installChannel, null);
      }
      sendMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-install-base-package', async (event: IpcMainInvokeEvent, installChannel: string) => {
    const childProcess = childProcessMap.get(installChannel);
    if (childProcess && childProcess.kill) {
      // kill child process
      childProcess.kill();
      childProcessMap.set(installChannel, null);
    }
  });
};
