import * as path from 'path';
import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';
import openAboutWindow from 'about-window';

const packageJSON = require('../package.json');

const { name } = packageJSON;

let mainWindow: BrowserWindow;
let updaterWindow: BrowserWindow;

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
  if (process.env.NODE_ENV === 'development') {
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

async function createUpdaterWindow() {
  // Create the browser window.
  updaterWindow = new BrowserWindow({
    width: 500,
    height: 300,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  if (isDev) {
    // Open the DevTools.
    updaterWindow.webContents.openDevTools();
    // eslint-disable-next-line @iceworks/best-practices/no-http-url
    await updaterWindow.loadURL('http://localhost:3000/updater/');
  } else {
    await updaterWindow.loadFile(path.resolve(__dirname, './assets/updater.html'));
  }
}

function sendToUpdaterWindow(channel: string, ...args: any[]) {
  updaterWindow.webContents.send(channel, ...args);
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
  createUpdaterWindow,
  sendToUpdaterWindow,
  createAboutWindow,
  mainWindow,
  updaterWindow,
};
