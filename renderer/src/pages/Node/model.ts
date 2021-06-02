import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';
import { INodeVersions } from '../../interfaces';

const DEFAULT_INSTALL_RESULT = { nodeVersion: '', npmVersion: '' };
const DEFAULT_INSTALL_NODE_FORM_VALUE = { reinstallGlobalDeps: true };
const DEFAULT_INSTALL_STATUS = {
  installNode: 'wait',
  reinstallPackages: 'wait',
};
const DEFAULT_INSTALL_ERR_MSG = {
  installNode: '',
  reinstallPackages: '',
};
const DEFAULT_NODE_VERSIONS: INodeVersions = {
  versions: [],
  majors: [],
};

export default {
  state: {
    nodeInfo: {},
    nodeVersions: DEFAULT_NODE_VERSIONS,
    currentStep: 0,
    installStatus: DEFAULT_INSTALL_STATUS,
    installErrMsg: DEFAULT_INSTALL_ERR_MSG,
    installResult: DEFAULT_INSTALL_RESULT,
    installNodeFormValue: DEFAULT_INSTALL_NODE_FORM_VALUE,
  },
  reducers: {
    updateNodeInfo(prevState, payload: IBasePackage) {
      prevState.nodeInfo = payload;
    },

    updateNodeVersions(prevState, payload: INodeVersions) {
      prevState.nodeVersions = payload;
    },

    updateStep(prevState, currentStep: number) {
      prevState.currentStep = currentStep;
    },

    initStep(prevState) {
      prevState.currentStep = 0;
    },

    updateInstallStatus(prevState, { status, stepName }) {
      prevState.installStatus[stepName] = status;
    },

    updateInstallErrMsg(prevState, { errMsg, stepName }) {
      prevState.installErrMsg[stepName] = errMsg;
    },

    initNodeInstall(prevState) {
      prevState.installStatus = DEFAULT_INSTALL_STATUS;
      prevState.installErrMsg = DEFAULT_INSTALL_ERR_MSG;
      prevState.installResult = DEFAULT_INSTALL_RESULT;
      prevState.installNodeFormValue = DEFAULT_INSTALL_NODE_FORM_VALUE;
    },

    updateInstallResult(prevState, installResult: object) {
      prevState.installResult = { ...prevState.installResult, ...installResult };
    },

    updateInstallNodeFormValue(prevState, formValue: object) {
      prevState.installNodeFormValue = formValue;
    },
  },
  effects: (dispatch) => ({
    async getNodeInfo() {
      const nodeInfo: IBasePackage = await ipcRenderer.invoke('get-node-info');
      dispatch.node.updateNodeInfo(nodeInfo);
    },

    async getNodeVersions() {
      const nodeVersions: INodeVersions = await ipcRenderer.invoke('get-node-versions');
      dispatch.node.updateNodeVersions(nodeVersions);
    },
  }),
};
