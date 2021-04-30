import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    nodeInfo: {},
    nodeVersionsList: [],
    currentStep: 0,
    installStatus: '',
    installErrMsg: '',
  },
  reducers: {
    updateNodeInfo(prevState, payload: IBasePackage) {
      prevState.nodeInfo = payload;
    },
    updateNodeVersionsList(prevState, payload: string[]) {
      prevState.nodeVersionsList = payload;
    },
    updateStep(prevState, currentStep: number) {
      prevState.currentStep = currentStep;
    },
    initStep(prevState) {
      prevState.currentStep = 0;
    },
    updateInstallStatus(prevState, installStatus: string) {
      prevState.installStatus = installStatus;
    },
    updateInstallErrMsg(prevState, installErrMsg: string) {
      prevState.installErrMsg = installErrMsg;
    },
    initNodeInstall(prevState) {
      prevState.installStatus = '';
      prevState.installErrMsg = '';
    },
  },
  effects: (dispatch) => ({
    async getNodeInfo() {
      const nodeInfo: IBasePackage = await ipcRenderer.invoke('get-node-info');
      dispatch.node.updateNodeInfo(nodeInfo);
    },

    async getNodeVersionsList(managerName: string) {
      const nodeVersionsList: string[] = await ipcRenderer.invoke('get-node-versions-list', managerName);
      dispatch.node.updateNodeVersionsList(nodeVersionsList);
    },
  }),
};
