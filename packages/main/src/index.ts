import { app, BrowserWindow } from 'electron';
import { join } from 'path';

const isDevelopment = import.meta.env.DEV;

async function createWindow() {
  const mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      preload: join(__dirname, '../../preload/build/index.cjs'),
    },
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

app.whenReady()
  .then(createWindow)
  .catch((error) => console.error('Failed to crate window:', error));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (!isDevelopment) {
  app.whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((error) => console.error('Failed check updates:', error));
}
