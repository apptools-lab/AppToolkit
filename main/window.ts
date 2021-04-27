import * as path from 'path';
import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';

let mainWindow: BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 724,
    minHeight: 500,
    minWidth: 1000,
    titleBarStyle: 'hiddenInset',
    frame: false,
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
  mainWindow.webContents.openDevTools();
}

function send(channel: string, ...args: any[]) {
  mainWindow.webContents.send(channel, ...args);
}

export {
  createWindow,
  send,
};
