import * as path from 'path';
import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import openAboutWindow from 'about-window';

const packageJSON = require('../package.json');

const { name } = packageJSON;

let mainWindow: BrowserWindow;

function createMainWindow() {
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
    mainWindow.loadURL('http://localhost:3000/main/');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.resolve(__dirname, './assets/main.html'));
  }
}

function sendToMainWindow(channel: string, ...args: any[]) {
  mainWindow.webContents.send(channel, ...args);
}

function createAboutWindow() {
  openAboutWindow({
    icon_path: path.join(__dirname, '../resources/icon.png'),
    product_name: name,
    package_json_dir: path.resolve(`${__dirname}/../`),
    copyright: 'Copyright © 2021-present AppToolkit',
    homepage: 'https://github.com/appworks-lab/toolkit',
    bug_report_url: 'https://github.com/appworks-lab/toolkit/issues',
  });
}

export {
  createMainWindow,
  sendToMainWindow,
  createAboutWindow,
};
