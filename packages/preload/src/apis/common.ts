import { ipcRenderer } from 'electron';

export default {
  openFile: () => ipcRenderer.invoke('dialog-getSelectedFolderPath'),
};