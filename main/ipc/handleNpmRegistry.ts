import { ipcMain, IpcMainInvokeEvent } from 'electron';
import checkNpmInstalled from '../npm/checkNpmInstalled';
import { getAllRegistries, setCurrentRegistry, getCurrentRegistry } from '../npm/registryManager';

export default () => {
  ipcMain.handle('check-npm-installed', () => {
    return checkNpmInstalled();
  });

  ipcMain.handle('get-all-npm-registries', () => {
    return getAllRegistries();
  });

  ipcMain.handle('get-current-npm-registry', () => {
    return getCurrentRegistry();
  });

  ipcMain.handle('set-current-npm-registry', async (e: IpcMainInvokeEvent, registry: string) => {
    await setCurrentRegistry(registry);
  });
};
