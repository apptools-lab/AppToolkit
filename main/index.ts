import { app, BrowserWindow } from 'electron';
import modifyProcessEnv from './utils/modifyProcessEnv';
import { createWindow } from './window';
import handleIPC from './ipc';
import { checkForUpdates } from './utils/autoUpdater';
import { autoDownloadPackages } from './autoDownloader';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

app.whenReady().then(() => {
  modifyProcessEnv();

  createWindow();

  handleIPC();

  checkForUpdates();

  autoDownloadPackages();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
