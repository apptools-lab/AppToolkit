import { ipcRenderer } from 'electron';

export default {
  state: {
    baseAppData: [],
  },
  reducers: {
    updateBaseAppData(prevState, payload) {
      prevState.baseAppData = payload;
    },
  },
  effects: (dispatch) => ({
    async getBaseApp() {
      const data = await ipcRenderer.invoke('getBaseApp');
      dispatch.dashboard.updateBaseAppData(data);
    },
  }),
};
