import { ipcRenderer } from 'electron';

export default {
  openFile: () => ipcRenderer.invoke('dialog-getSelectedFolderPath'),

  getPlatform: () => process.platform,
};