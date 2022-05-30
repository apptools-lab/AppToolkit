import { ipcMain } from 'electron';
import getSelectedFolderPath from '../common/getSelectedFolderPath';

export function registerCommonIpcEvents() {
  ipcMain.handle('dialog-getSelectedFolderPath', getSelectedFolderPath);
}
