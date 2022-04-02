import { ipcMain } from 'electron';
import getSelectedFolderPath from './getSelectedFolderPath';

export function registerCommonIpcHandleEvents() {
  ipcMain.handle('dialog-getSelectedFolderPath', getSelectedFolderPath);
}
