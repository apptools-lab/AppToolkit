import { ipcRenderer } from 'electron';
import type { GitConfig } from '../../../types';

export default {
  getGlobalGitConfig: () => ipcRenderer.invoke('git-getGlobalConfig'),

  setGlobalGitConfig: (config: GitConfig) => ipcRenderer.invoke('git-setGlobalConfig', config),
};
