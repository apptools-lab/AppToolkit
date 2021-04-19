import { ipcRenderer } from 'electron';

export default {
  state: {
    basePackagesData: [],
    isInstalling: false,
  },
  reducers: {
    updateBasePackagesData(prevState, payload) {
      prevState.basePackagesData = payload;
    },
    updateInstallStatus(prevState, payload: boolean) {
      prevState.isInstalling = payload;
    },
  },
  effects: (dispatch) => ({
    async getBasePackages() {
      const data = await ipcRenderer.invoke('getBasePackages');
      dispatch.dashboard.updateBasePackagesData(data);
    },
  }),
};
