import { ipcMain } from 'electron';
import { IpcMainInvokeEvent } from 'electron/main';
import {
  getGitConfig,
  setGitConfig,
} from '../git';

export default () => {
  ipcMain.handle('get-git-config', async (e: IpcMainInvokeEvent, configWorkspaceDir?: string) => {
    return await getGitConfig(configWorkspaceDir);
  });
  ipcMain.handle('set-git-config', async (e: IpcMainInvokeEvent, args: { gitConfig: any; configWorkspaceDir?: string }) => {
    return await setGitConfig(args);
  });
};
