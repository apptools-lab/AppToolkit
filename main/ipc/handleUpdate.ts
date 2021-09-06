import { ipcMain, app } from 'electron';
import autoUpdater from '../autoUpdater';
import { updaterWindow } from '../window';

export default () => {
  ipcMain.handle('app-quit-install', () => {
    autoUpdater.quitAndInstall();
    app.quit();
  });

  ipcMain.handle('close-updater', () => {
    updaterWindow.close();
  });
};
