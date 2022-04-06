import { contextBridge } from 'electron';
import apis from './apis';

window.addEventListener('DOMContentLoaded', () => {
  ['chrome', 'node', 'electron'].forEach((type) => {
    console.log(`${type}-version`, process.versions[type]);
  });
});

/** Expose ipcRender */
contextBridge.exposeInMainWorld('electronAPI', apis);
