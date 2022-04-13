import { BrowserWindow } from 'electron';
import { registerCommonIpcEvents } from './common';
import { registerGitIpcEvents } from './git';

export function handleIpc(mainWindow: BrowserWindow) {
  registerCommonIpcEvents(mainWindow);

  registerGitIpcEvents();
}
