import { ipcRenderer } from 'electron';

export default {
  getToolsInfo: () => ipcRenderer.invoke('tool-getInfo'),
};
