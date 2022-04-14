import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import getSelectedFolderPath from '../common/getSelectedFolderPath';

export function registerCommonIpcEvents(mainWindow: BrowserWindow) {
  ipcMain.handle('dialog-getSelectedFolderPath', getSelectedFolderPath);

  ipcMain.on('min-app', () => {
    mainWindow.minimize();
  });
  ipcMain.on('max-app', (event) => {
    if (mainWindow.isMaximized()) {
      event.returnValue = false;
      mainWindow.unmaximize();
    } else {
      event.returnValue = true;
      mainWindow.maximize();
    }
  });
  ipcMain.on('close-app', () => {
    mainWindow.close();
  });
}
