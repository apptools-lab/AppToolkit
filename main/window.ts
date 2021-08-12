import * as path from 'path';
import { BrowserWindow } from 'electron';

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
  if (process.env.NODE_ENV === 'development') {
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
