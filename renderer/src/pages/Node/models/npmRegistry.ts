import { NPMRegistry } from '@/interfaces/node';
import { ipcRenderer } from 'electron';

export default {
  state: {
    npmInstalled: false,
    allNpmRegistries: [],
    currentNpmRegistry: '',
    isAliInternal: false,
  },
  effects: () => ({
    async getAllNpmRegistries() {
      const allNpmRegistries: NPMRegistry[] = await ipcRenderer.invoke('get-all-npm-registries');
      const npmRegistries = allNpmRegistries
        .map(({ registry, recommended = false }: NPMRegistry) => ({ value: registry, label: registry, recommended }));
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

    async checkIsAliInternal() {
      const isAliInternal = await ipcRenderer.invoke('check-is-ali-internal');
      this.setState({ isAliInternal });
    },
  }),
};
