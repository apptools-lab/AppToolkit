import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import { AddUserConfig } from 'types/git';
import {
  getGlobalGitConfig,
  updateGlobalGitConfig,
  getUserGitConfigs,
  updateUserGitConfig,
  addUserGitConfig,
  removeUserGitConfig,
  generateSSHKey,
  updateUserGitDir,
  getExistedUserGitConfigNames,
  removeUserGitDir,
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
  ) => {
    await updateUserGitConfig(currentGitConfig, configName);
  });

  ipcMain.handle('add-user-git-config', async (e: IpcMainInvokeEvent, gitConfig: AddUserConfig) => {
    await addUserGitConfig(gitConfig);
  });

  ipcMain.handle('get-existed-user-git-config-names', async () => {
    return await getExistedUserGitConfigNames();
  });

  ipcMain.handle('update-user-git-dir', async (
    e: IpcMainInvokeEvent,
    originGitDir: string,
    currentGitDir: string,
    configName: string,
  ) => {
    await updateUserGitDir(originGitDir, currentGitDir, configName);
  });

  ipcMain.handle('remove-user-git-dir', async (
    e: IpcMainInvokeEvent,
    gitDir: string,
    configName: string,
  ) => {
    await removeUserGitDir(gitDir, configName);
  });

  ipcMain.handle('remove-user-git-config', async (
    e: IpcMainInvokeEvent,
    configName: string,
    gitDirs: string[],
  ) => {
    await removeUserGitConfig(configName, gitDirs);
  });

  ipcMain.handle('generate-ssh-key', async (
    e: IpcMainInvokeEvent,
    configName: string,
    userEmail: string,
  ) => {
    return await generateSSHKey(configName, userEmail);
  });
};
