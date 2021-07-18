import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import {
  getGlobalGitConfig,
  setGitConfig,
  getUserGitConfigs,
  addUserGitConfig,
  removeUserGitConfig,
  generateSSHKey,
  updateUserGitDir,
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

  ipcMain.handle('update-user-git-dir', async (
    e: IpcMainInvokeEvent,
    originGitDir: string,
    currentGitDir: string) => {
    await updateUserGitDir(originGitDir, currentGitDir);
  });

  ipcMain.handle('remove-user-git-config', async (e: IpcMainInvokeEvent, gitDir: string, gitConfigPath: string) => {
    await removeUserGitConfig(gitDir, gitConfigPath);
  });

  ipcMain.handle('generate-ssh-key', async (e: IpcMainInvokeEvent, userEmail: string, configName: string) => {
    await generateSSHKey(userEmail, configName);
  });
};
