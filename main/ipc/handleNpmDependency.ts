import { ipcMain } from 'electron';
import { getGlobalDependencies } from '../npm/dependency';

export default () => {
  ipcMain.handle('get-global-npm-dependencies', async () => {
    const globalDependencies = await getGlobalDependencies();
    return globalDependencies;
  });
};
