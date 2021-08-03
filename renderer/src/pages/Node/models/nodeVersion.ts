import { IPackageInfo, INodeVersions } from '@/interfaces';
import { ipcRenderer } from 'electron';

const DEFAULT_INSTALL_RESULT = { nodeVersion: '', npmVersion: '' };
const DEFAULT_NODE_INSTALL_FORM_VALUE = {};
const DEFAULT_NODE_INSTALL_STATUS = {
  installNode: 'wait',
  reinstallPackages: 'wait',
};
const DEFAULT_NODE_INSTALL_ERR_MSG = {
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
    nodeInstallStatus: DEFAULT_NODE_INSTALL_STATUS,
    nodeInstallErrMsg: DEFAULT_NODE_INSTALL_ERR_MSG,
    installResult: DEFAULT_INSTALL_RESULT,
    nodeInstallFormValue: DEFAULT_NODE_INSTALL_FORM_VALUE,
    nodeInstallVisible: false,
    nodeInstallChannel: 'install-node',
    nodeInstallProcessStatusChannel: 'install-node-process-status',
  },
  reducers: {
    updateNodeInfo(prevState, payload: IPackageInfo) {
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
      const nodeInfo: IPackageInfo = await ipcRenderer.invoke('get-node-info');
      dispatch.nodeVersion.updateNodeInfo(nodeInfo);
    },

    async getNodeVersions() {
      const nodeVersions: INodeVersions = await ipcRenderer.invoke('get-node-versions');
      dispatch.nodeVersion.updateNodeVersions(nodeVersions);
    },

    async clearCaches({ processChannel, installChannel }) {
      await ipcRenderer.invoke('clear-node-install-cache', { processChannel, installChannel });
    },

    async getCaches({ processChannel, installChannel }) {
      // TODO: handle install log cache
      const { processCaches } = await ipcRenderer.invoke(
        'get-node-install-cache',
        { processChannel, installChannel },
      );

      if (Array.isArray(processCaches)) {
        processCaches.forEach(({ task, status, result, errMsg }) => {
          dispatch.nodeVersion.updateNodeInstallStatus({ status, stepName: task });
          // update install result or err
          if (status === 'success') {
            if (result) {
              dispatch.nodeVersion.updateInstallResult(result);
            }
          } else if (status === 'error') {
            dispatch.nodeVersion.updateNodeInstallErrMsg({ errMsg, stepName: task });
          }
          // update current step
          if (status === 'success' || status === 'error') {
            if (task === 'installNode') {
              dispatch.nodeVersion.updateStep(2);
            } else if (task === 'reinstallPackages') {
              dispatch.nodeVersion.updateStep(3);
            }
          } else if (status === 'done') {
            dispatch.nodeVersion.updateStep(3);
          }
        });
      }
    },
  }),
};
