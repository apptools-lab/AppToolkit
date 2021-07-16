import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import {
  getGlobalGitConfig,
  setGitConfig,
  getUserGitConfigs,
  addUserGitConfig,
  removeUserGitConfig,
  updateUserGitConfig,
} from '../git';

export default () => {
  ipcMain.handle('get-global-git-config', async () => {
    return await getGlobalGitConfig();
  });
  ipcMain.handle('get-user-git-configs', async () => {
    return await getUserGitConfigs();
  });
  ipcMain.handle('set-git-config', async (e: IpcMainInvokeEvent, gitConfig: any, gitConfigPath?: string) => {
    await setGitConfig(gitConfig, gitConfigPath);
  });
  ipcMain.handle('add-user-git-config', async (e: IpcMainInvokeEvent, name: string, gitDir: string) => {
    await addUserGitConfig(name, gitDir);
  });
  ipcMain.handle('update-user-git-config', async (
    e: IpcMainInvokeEvent,
    originGitConfig: { name: string; gitDir: string },
    currentGitConfig: { name: string; gitDir: string }) => {
    await updateUserGitConfig(originGitConfig, currentGitConfig);
  });

  ipcMain.handle('remove-user-git-config', async (e: IpcMainInvokeEvent, gitDir: string, gitConfigPath: string) => {
    await removeUserGitConfig(gitDir, gitConfigPath);
  });
};
