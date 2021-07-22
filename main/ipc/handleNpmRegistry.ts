import { ipcMain, IpcMainInvokeEvent } from 'electron';
import checkNpmInstalled from '../npm/checkNpmInstalled';
import { getAllRegistries, setCurrentRegistry, getCurrentRegistry } from '../npm/registry';

export default () => {
  ipcMain.handle('check-npm-installed', () => {
    return checkNpmInstalled();
  });

  ipcMain.handle('get-all-npm-registries', async () => {
    const allRegistries = await getAllRegistries();
    return allRegistries;
  });

  ipcMain.handle('get-current-npm-registry', async () => {
    const currentRegistry = await getCurrentRegistry();
    return currentRegistry;
  });

  ipcMain.handle('set-current-npm-registry', async (e: IpcMainInvokeEvent, registry: string) => {
    await setCurrentRegistry(registry);
  });
};
