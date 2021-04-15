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
    async getBasePackage() {
      const data = await ipcRenderer.invoke('getBasePackage');
      dispatch.dashboard.updateBasePackageData(data);
    },
  }),
};
