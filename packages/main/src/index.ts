import { app, BrowserWindow } from 'electron';
import { join } from 'path';
import { handleIpc } from './ipc';

const isDevelopment = import.meta.env.DEV;

app.whenReady()
  .then(() => {
    handleIpc();

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .catch((error) => console.error('Failed to crate window:', error));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app auto update
if (!isDevelopment) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((error) => console.error('Failed check updates:', error));
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      preload: join(__dirname, '../../preload/build/index.cjs'),
    },
    width: 800,
    height: 600,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();

    if (isDevelopment) {
      mainWindow?.webContents.openDevTools();
    }
  });

  const { RENDERER_DEV_SERVER_URL } = process.env;

  const pageUrl = isDevelopment && RENDERER_DEV_SERVER_URL
    ? RENDERER_DEV_SERVER_URL
    : new URL(join(__dirname, '../../renderer/build/index.html'), `file://${__dirname}`).toString();

  await mainWindow.loadURL(pageUrl);
}
