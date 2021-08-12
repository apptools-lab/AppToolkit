import { app, BrowserWindow } from 'electron';
import modifyProcessEnv from './utils/modifyProcessEnv';
import { createWindow } from './window';
import handleIPC from './ipc';
import { checkForUpdates } from './utils/autoUpdater';
import getPackagesData from './utils/getPackagesData';
import { autoDownloadPackages } from './autoDownloader';
import store, { packagesDataKey } from './store';
import { recordDAU } from './recorder';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

app.whenReady()
  .then(() => getPackagesData())
  .then((packagesData) => {
    store.set(packagesDataKey, packagesData);
  })
  .finally(() => {
    modifyProcessEnv();

    createWindow();

    handleIPC();

    checkForUpdates();

    autoDownloadPackages();

    recordDAU();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
