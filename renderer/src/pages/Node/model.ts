import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    nodeInfo: {},
    nodeVersionsList: [],
  },
  reducers: {
    updateNodeInfo(prevState, payload: IBasePackage) {
      prevState.nodeInfo = payload;
    },
    updateNodeVersionsList(prevState, payload: string[]) {
      prevState.nodeVersionsList = payload;
    },
  },
  effects: (dispatch) => ({
    async getNodeInfo() {
      const nodeInfo: IBasePackage = await ipcRenderer.invoke('get-node-info');
      dispatch.node.updateNodeInfo(nodeInfo);
    },
    async getNodeVersionsList(managerName: string) {
      console.log('managerName', managerName);
      const nodeVersionsList: string[] = await ipcRenderer.invoke('get-node-versions-list', managerName);
      dispatch.node.updateNodeVersionsList(nodeVersionsList);
    },
  }),
};
