import { ipcRenderer } from 'electron';

export default {
  state: {
    basePackageData: [],
    isInstalling: false,
  },
  reducers: {
    updateBasePackageData(prevState, payload) {
      prevState.basePackageData = payload;
    },
    updateInstallStatus(prevState, payload: boolean) {
      prevState.isInstalling = payload;
    },
  },
  effects: (dispatch) => ({
    async getBasePackages() {
      const data = await ipcRenderer.invoke('getBasePackages');
      dispatch.dashboard.updateBasePackageData(data);
    },
  }),
};
