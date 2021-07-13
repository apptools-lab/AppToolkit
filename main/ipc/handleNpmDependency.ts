import { ipcMain, IpcMainInvokeEvent } from 'electron';
import {
  getGlobalDependencies,
  uninstallGlobalDependency,
  updateGlobalDependency,
  reinstallGlobalDependency,
} from '../npm/dependency';

export default () => {
  ipcMain.handle('get-global-npm-dependencies', async () => {
    const globalDependencies = await getGlobalDependencies();
    return globalDependencies;
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
};
