import { ipcRenderer } from 'electron';

export default {
  openFile: () => ipcRenderer.invoke('dialog-getSelectedFolderPath'),

  getPlatform: () => process.platform,

  setMin: () => ipcRenderer.send('min-app'),
  setMax: () => { return ipcRenderer.sendSync('max-app'); },
  setClose: () => ipcRenderer.send('close-app'),
};
