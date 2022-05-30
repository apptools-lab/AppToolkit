import type { BrowserWindow } from 'electron';
import { registerCommonIpcEvents } from './common';
import { registerGitIpcEvents } from './git';
import { registerToolIpcEvents } from './tool';

export function handleIpc(
  // mainWindow: BrowserWindow
) {
  registerToolIpcEvents();
  // registerCommonIpcEvents(mainWindow);

  registerGitIpcEvents();
}
