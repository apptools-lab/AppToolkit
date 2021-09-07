import { PackageInfo, ProcessStatus } from '@/types/base';
import { ipcRenderer } from 'electron';

interface State {
  appsInfo: PackageInfo[];
  installStatuses: ProcessStatus[];
  detailVisible: boolean;
  currentExtensionInfo: PackageInfo;
}

export default {
  state: {
    extensionsInfo: [],
    installStatuses: [],
    detailVisible: false,
    currentExtensionInfo: {},
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
  },
  effects: () => ({
    async getExtensionsInfo() {
      const extensionsInfo = await ipcRenderer.invoke('get-browser-extensions-info');
      this.setState({ extensionsInfo });
    },
    async checkBrowserHostAlive(browserType: string) {
      return await ipcRenderer.invoke('check-webstore-host-alive', browserType);
    },
  }),
};
