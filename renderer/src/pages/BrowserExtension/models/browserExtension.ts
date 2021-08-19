import { PackageInfo } from '@/interfaces/base';
import { ProcessStatus } from '@/interfaces/application';
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
      const statusIndex = prevState.installStatuses.findIndex(({ name }) => installStatus.name === name);
      if (statusIndex > -1) {
        prevState.installStatuses.splice(statusIndex, 1, installStatus);
      } else {
        prevState.installStatuses.push(installStatus);
      }
    },
    removeInstallStatus(prevState: State, installStatus: ProcessStatus) {
      const statusIndex = prevState.installStatuses.findIndex(({ name }) => installStatus.name === name);
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
  }),
};
