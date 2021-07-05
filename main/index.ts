import { app, BrowserWindow } from 'electron';
import modifyProcessEnv from './utils/modifyProcessEnv';
import { createWindow } from './window';
import handleIPC from './ipc';
import { checkForUpdates } from './utils/autoUpdater';
import { recordDAU } from './recorder';
import log from './utils/log';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

app.whenReady().then(() => {
  checkForUpdates();

  modifyProcessEnv();

  createWindow();

  handleIPC();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();

    recordDAU()
      .catch((err) => {
        log.error(err);
      });
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
