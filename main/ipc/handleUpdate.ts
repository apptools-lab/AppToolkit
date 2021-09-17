import { ipcMain, app } from 'electron';
import autoUpdater from '../autoUpdater';

export default () => {
  ipcMain.handle('app-quit-install', () => {
    autoUpdater.quitAndInstall();
    app.quit();
  });
};
