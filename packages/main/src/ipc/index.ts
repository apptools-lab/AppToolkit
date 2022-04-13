import { BrowserWindow } from 'electron';
import { registerCommonIpcEvents } from './common';

export function handleIpc(mainWindow: BrowserWindow) {
  registerCommonIpcEvents(mainWindow);
}
