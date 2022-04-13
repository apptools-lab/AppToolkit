import { BrowserWindow, ipcMain } from 'electron';
import getSelectedFolderPath from '../common/getSelectedFolderPath';

export function registerCommonIpcEvents(mainWindow: BrowserWindow) {
  ipcMain.handle('dialog-getSelectedFolderPath', getSelectedFolderPath);

  ipcMain.on('min-app', () => {
    mainWindow.minimize();
  });
}
