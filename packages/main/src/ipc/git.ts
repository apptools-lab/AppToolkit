import { ipcMain } from 'electron';
import {
  getGlobalGitConfig,
  setGlobalGitConfig,
} from '../git';

export function registerGitIpcEvents() {
  ipcMain.handle('git-getGlobalConfig', getGlobalGitConfig);

  ipcMain.handle('git-setGlobalConfig', (e, config) => setGlobalGitConfig(config));
}
