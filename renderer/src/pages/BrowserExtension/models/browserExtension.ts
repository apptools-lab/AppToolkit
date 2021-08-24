import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { ipcRenderer } from 'electron';

interface State {
  appsInfo: PackageInfo[];
  installStatuses: ProcessStatus[];
}

export default {
  state: {
    extensionsInfo: [],
    installStatuses: [],
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
