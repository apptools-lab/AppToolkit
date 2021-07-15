import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import {
  getGlobalGitConfig,
  setGitConfig,
  getUserGitConfigs,
} from '../git';

export default () => {
  ipcMain.handle('get-global-git-config', async () => {
    return await getGlobalGitConfig();
  });
  ipcMain.handle('get-user-git-configs', async () => {
    return await getUserGitConfigs();
  });
  ipcMain.handle('set-git-config', async (e: IpcMainInvokeEvent, gitConfig: any, gitConfigPath?: string) => {
    return await setGitConfig(gitConfig, gitConfigPath);
  });
};
