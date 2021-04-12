import * as isDev from 'electron-is-dev';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import handleIPC from './ipc';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 722,
    minHeight: 722,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  if (isDev) {
    // eslint-disable-next-line @iceworks/best-practices/no-http-url
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.resolve(__dirname, './assets/index.html'));
  }
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  handleIPC();
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
