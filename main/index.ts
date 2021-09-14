import { app, BrowserWindow } from 'electron';
import modifyProcessEnv from './utils/modifyProcessEnv';
import { createMainWindow } from './window';
import handleIPC from './ipc';
import { checkForUpdates } from './autoUpdater';
import getPackagesData from './utils/getPackagesData';
import { autoDownloadPackages } from './autoDownloader';
import store, { packagesDataKey } from './store';
import { recordDAU } from './recorder';
import setMenu from './menu';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

app.whenReady()
  .then(() => getPackagesData())
  .then((packagesData) => {
    store.set(packagesDataKey, packagesData);
  })
  .finally(() => {
    modifyProcessEnv();

    createMainWindow();

    handleIPC();

    setMenu();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });


app.on('will-finish-launching', () => {
  checkForUpdates();

  autoDownloadPackages();

  recordDAU();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
