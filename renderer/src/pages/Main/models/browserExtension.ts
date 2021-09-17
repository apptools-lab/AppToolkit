import { PackageInfo, ProcessStatus } from '@/types/base';
import { ipcRenderer } from 'electron';

interface State {
  appsInfo: PackageInfo[];
  installStatuses: ProcessStatus[];
  detailVisible: boolean;
  currentExtensionInfo: PackageInfo;
  checkingBrowserHostExtensionId: string[];
}

export default {
  state: {
    extensionsInfo: [],
    installStatuses: [],
    detailVisible: false,
    currentExtensionInfo: {},
    checkingBrowserHostExtensionId: [],
  },
  reducers: {
    updateInstallStatus(prevState: State, installStatus: ProcessStatus) {
      const statusIndex = prevState.installStatuses.findIndex(({ id }) => installStatus.id === id);
      if (statusIndex > -1) {
        prevState.installStatuses.splice(statusIndex, 1, installStatus);
      } else {
        prevState.installStatuses.push(installStatus);
      }
    },
    removeInstallStatus(prevState: State, installStatus: ProcessStatus) {
      const statusIndex = prevState.installStatuses.findIndex(({ id }) => installStatus.id === id);
      if (statusIndex > -1) {
        prevState.installStatuses.splice(statusIndex, 1);
      }
    },
    setDetailVisible(prevState: State, detailVisible: boolean) {
      prevState.detailVisible = detailVisible;
    },
    setCurrentExtensionInfo(prevState: State, extensionInfo: PackageInfo) {
      prevState.currentExtensionInfo = extensionInfo;
    },
    addCheckingBrowserHostExtensionId(prevState: State, extensionId: string) {
      prevState.checkingBrowserHostExtensionId.push(extensionId);
    },
    removeCheckingBrowserHostExtensionId(prevState: State, extensionId: string) {
      const index = prevState.checkingBrowserHostExtensionId.findIndex((id: string) => extensionId === id);
      if (index > -1) {
        prevState.checkingBrowserHostExtensionId.splice(index, 1);
      }
    },
  },
  effects: () => ({
    async getExtensionsInfo() {
      const extensionsInfo = await ipcRenderer.invoke('get-browser-extensions-info');
      this.setState({ extensionsInfo });
    },
    async checkBrowserHostIsAccessible(browserType: string) {
      return await ipcRenderer.invoke('check-webstore-host-is-accessible', browserType);
    },
  }),
};
