import { ipcRenderer } from 'electron';

export default {
  state: {
    npmDependencies: [],
  },
  effects: () => ({
    async getNpmDependencies() {
      const npmDependencies = await ipcRenderer.invoke('get-global-npm-dependencies');
      this.setState({ npmDependencies });
    },
  }),
};
