import { contextBridge } from 'electron';
import apis from './apis';

window.addEventListener('DOMContentLoaded', () => {
  ['chrome', 'node', 'electron'].forEach((type) => {
    console.log(`${type}-version`, process.versions[type]);
  });

  addDragPropertyValueToWindow();
});

/* support window draggable */
function addDragPropertyValueToWindow() {
  // Ref: https://www.electronjs.org/zh/docs/latest/api/frameless-window#%E5%8F%AF%E6%8B%96%E6%8B%BD%E5%8C%BA
  // @ts-ignore
  document.body.style['-webkit-app-region'] = 'drag';
}

/** Expose ipcRender */
contextBridge.exposeInMainWorld('electronAPI', apis);
