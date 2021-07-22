import { INPMRegistry } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    npmInstalled: false,
    allNpmRegistries: [],
    currentNpmRegistry: '',
  },
  effects: () => ({
    async getAllNpmRegistries() {
      const allNpmRegistries: INPMRegistry[] = await ipcRenderer.invoke('get-all-npm-registries');
      const npmRegistries = allNpmRegistries
        .map(({ registry }: INPMRegistry) => registry);
      this.setState({ allNpmRegistries: npmRegistries });
    },

    async getCurrentNpmRegistry() {
      const currentNpmRegistry: string = await ipcRenderer.invoke('get-current-npm-registry');
      this.setState({ currentNpmRegistry });
    },

    async setCurrentNpmRegistry(registry: string) {
      await ipcRenderer.invoke('set-current-npm-registry', registry);
      this.setState({ currentNpmRegistry: registry });
    },

    async checkNpmInstalled() {
      const npmInstalled = await ipcRenderer.invoke('check-npm-installed');
      this.setState({ npmInstalled });
    },
  }),
};
