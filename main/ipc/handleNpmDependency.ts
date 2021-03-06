import * as child_process from 'child_process';
import * as path from 'path';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { sendToMainWindow } from '../window';
import {
  getGlobalDependencies,
  uninstallGlobalDependency,
  updateGlobalDependency,
  reinstallGlobalDependency,
  searchNpmDependencies,
  installGlobalDependency,
  getGlobalDependenciesInfo,
} from '../npm/dependency';
import killChannelChildProcess from '../utils/killChannelChildProcess';
import { record } from '../recorder';

const childProcessMap = new Map();

export default () => {
  ipcMain.handle('get-global-npm-dependencies', async (e: IpcMainInvokeEvent, force) => {
    const globalDependencies = await getGlobalDependencies(force);
    return globalDependencies;
  });

  ipcMain.handle('install-global-npm-dependency', async (e: IpcMainInvokeEvent, dependency: string, version: string) => {
    await installGlobalDependency(dependency, version);
  });

  ipcMain.handle('uninstall-global-npm-dependency', async (e: IpcMainInvokeEvent, dependency: string) => {
    await uninstallGlobalDependency(dependency);
  });

  ipcMain.handle('update-global-npm-dependency', async (e: IpcMainInvokeEvent, dependency: string) => {
    await updateGlobalDependency(dependency);
  });

  ipcMain.handle('reinstall-global-npm-dependency', async (e: IpcMainInvokeEvent, dependency: string, version: string) => {
    await reinstallGlobalDependency(dependency, version);
  });

  ipcMain.handle('search-npm-dependencies', async (e: IpcMainInvokeEvent, query: string) => {
    return await searchNpmDependencies(query);
  });

  ipcMain.handle('get-global-dependencies-info', async () => {
    return await getGlobalDependenciesInfo();
  });

  ipcMain.handle('create-custom-global-dependencies-dir', async (e: IpcMainInvokeEvent, channel: string, currentGlobalDepsPath: string) => {
    /**
     * we need to cancel the process
     * so we create a childProcess and we can kill it later
     */
    const childProcess = child_process.fork(path.join(__dirname, '..', 'npm/dependency/createCustomGlobalDepsDir'));
    childProcessMap.set(channel, childProcess);

    childProcess.send({ currentGlobalDepsPath, channel });

    childProcessMap.set(channel, childProcess);

    childProcess.on('message', ({ data }: any) => {
      switch (data.status) {
        case 'done':
          record({
            module: 'node',
            action: 'createCustomGlobalDependenciesDir',
          });
        // eslint-disable-next-line no-fallthrough
        case 'error':
          killChannelChildProcess(childProcessMap, channel);
          break;
        default:
          break;
      }
      sendToMainWindow(channel, data);
    });
  });

  ipcMain.handle('cancel-create-custom-global-dependencies-dir', async (e: IpcMainInvokeEvent, channel: string) => {
    killChannelChildProcess(childProcessMap, channel);
  });
};
