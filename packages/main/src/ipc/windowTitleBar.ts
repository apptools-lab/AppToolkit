import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';

export function registerWindowTitleBarIpcEvents(browserWindow: BrowserWindow) {
  ipcMain.on('min-app', () => {
    browserWindow.minimize();
  });
  ipcMain.on('max-app', (event) => {
    if (browserWindow.isMaximized()) {
      event.returnValue = false;
      browserWindow.unmaximize();
    } else {
      event.returnValue = true;
      browserWindow.maximize();
    }
  });
  ipcMain.on('close-app', () => {
    browserWindow.close();
  });
}