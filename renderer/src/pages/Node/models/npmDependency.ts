import { INpmDependency } from '@/interfaces/npmDependency';
import { ipcRenderer } from 'electron';

export default {
  state: {
    npmDependencies: [],
    currentDependency: {},
  },
  reducers: {
    setCurrentDependency(prevState, currentDependency: INpmDependency) {
      prevState.currentDependency = currentDependency;
    },
  },
  effects: () => ({
    async getGlobalNpmDependencies() {
      const npmDependencies = await ipcRenderer.invoke('get-global-npm-dependencies');
      this.setState({ npmDependencies });
    },

    async uninstallGlobalNpmDependency(dependency: string) {
      await ipcRenderer.invoke('uninstall-global-npm-dependency', dependency);
    },

    async updateGlobalNpmDependency(dependency: string) {
      await ipcRenderer.invoke('update-global-npm-dependency', dependency);
    },

    async reinstallGlobalNpmDependency({ dependency, version }: {dependency: string; version: string}) {
      await ipcRenderer.invoke('reinstall-global-npm-dependency', dependency, version);
    },

    async installGlobalNpmDependency(dependency: string) {
      await ipcRenderer.invoke('install-global-npm-dependency', dependency);
    },
  }),
};
