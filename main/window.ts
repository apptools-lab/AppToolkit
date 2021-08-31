import * as path from 'path';
import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';

let mainWindow: BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 860,
    height: 600,
    minWidth: 860,
    minHeight: 600,
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
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.resolve(__dirname, './assets/index.html'));
  }
}

function send(channel: string, ...args: any[]) {
  mainWindow.webContents.send(channel, ...args);
}

export {
  createWindow,
  send,
};
