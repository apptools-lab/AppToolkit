import { ipcRenderer } from 'electron';

export default {
  getRecommendedToolsInfo: () => ipcRenderer.invoke('tool.getRecommendedToolsInfo'),
};
