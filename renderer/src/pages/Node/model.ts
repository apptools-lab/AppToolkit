import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';

const DEFAULT_INSTALL_RESULT = { nodeVersion: '', npmVersion: '' };
const DEFAULT_NODE_INSTALL_FORM_VALUE = { reinstallGlobalDeps: true };
const DEFAULT_NODE_INSTALL_STATUS = {
  installNode: 'wait',
  reinstallPackages: 'wait',
};
const DEFAULT_NODE_INSTALL_ERR_MSG = {
  installNode: '',
  reinstallPackages: '',
};
export default {
  state: {
    nodeInfo: {},
    nodeVersionsList: [],
    currentStep: 0,
    nodeInstallStatus: DEFAULT_NODE_INSTALL_STATUS,
    nodeInstallErrMsg: DEFAULT_NODE_INSTALL_ERR_MSG,
    installResult: DEFAULT_INSTALL_RESULT,
    nodeInstallFormValue: DEFAULT_NODE_INSTALL_FORM_VALUE,
    nodeInstallVisible: false,
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

    updateNodeInstallStatus(prevState, { status, stepName }) {
      prevState.nodeInstallStatus[stepName] = status;
    },

    updateNodeInstallErrMsg(prevState, { errMsg, stepName }) {
      prevState.nodeInstallErrMsg[stepName] = errMsg;
    },

    initNodeInstall(prevState) {
      prevState.nodeInstallStatus = DEFAULT_NODE_INSTALL_STATUS;
      prevState.nodeInstallErrMsg = DEFAULT_NODE_INSTALL_ERR_MSG;
      prevState.installResult = DEFAULT_INSTALL_RESULT;
      prevState.installNodeFormValue = DEFAULT_NODE_INSTALL_FORM_VALUE;
    },

    updateInstallResult(prevState, installResult: object) {
      prevState.installResult = { ...prevState.installResult, ...installResult };
    },

    updateNodeInstallFormValue(prevState, formValue: object) {
      prevState.nodeInstallFormValue = formValue;
    },

    setNodeInstallVisible(prevState, visible: boolean) {
      prevState.nodeInstallVisible = visible;
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
