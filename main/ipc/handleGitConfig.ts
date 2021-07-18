import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import {
  getGlobalGitConfig,
  updateGlobalGitConfig,
  getUserGitConfigs,
  updateUserGitConfig,
  addUserGitConfig,
  removeUserGitConfig,
  generateSSHKey,
  updateUserGitDir,
  addSSHConfig,
} from '../git';

export default () => {
  ipcMain.handle('get-global-git-config', async () => {
    return await getGlobalGitConfig();
  });

  ipcMain.handle('update-global-git-config', async (e: IpcMainInvokeEvent, gitConfig: object) => {
    await updateGlobalGitConfig(gitConfig);
  });

  ipcMain.handle('get-user-git-configs', async () => {
    return await getUserGitConfigs();
  });

  ipcMain.handle('update-user-git-config', async (
    e: IpcMainInvokeEvent,
    currentGitConfig: object,
    configName: string,
    gitConfigPath: string,
  ) => {
    await updateUserGitConfig(currentGitConfig, configName, gitConfigPath);
  });

  ipcMain.handle('add-user-git-config', async (e: IpcMainInvokeEvent, configName: string, gitDir: string) => {
    await addUserGitConfig(configName, gitDir);
  });

  ipcMain.handle('update-user-git-dir', async (
    e: IpcMainInvokeEvent,
    originGitDir: string,
    currentGitDir: string,
  ) => {
    await updateUserGitDir(originGitDir, currentGitDir);
  });

  ipcMain.handle('remove-user-git-config', async (
    e: IpcMainInvokeEvent,
    configName: string,
    gitDir: string,
    gitConfigPath: string,
    gitConfig: any,
  ) => {
    await removeUserGitConfig(configName, gitDir, gitConfigPath, gitConfig);
  });

  ipcMain.handle('generate-ssh-key', async (
    e: IpcMainInvokeEvent,
    {
      userEmail,
      configName,
      hostName,
      userName,
    }: {
      userEmail: string;
      configName: string;
      hostName: string;
      userName: string;
    }) => {
    await generateSSHKey(userEmail, configName);
    await addSSHConfig({ hostName, configName, userName });
  });
};
