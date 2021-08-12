import { ipcRenderer } from 'electron';

export default {
  state: {
    appsInfo: [],
  },
  effects: () => ({
    async getAppsInfo() {
      const appsInfo = await ipcRenderer.invoke('get-apps-info');
      this.setState({ appsInfo });
    },
  }),
};
