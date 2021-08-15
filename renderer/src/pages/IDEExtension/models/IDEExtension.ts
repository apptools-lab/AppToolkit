import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { ipcRenderer } from 'electron';

interface State {
  extensionsInfo: PackageInfo[];
  installStatuses: ProcessStatus[];
  uninstallStatuses: ProcessStatus[];
}

export default {
  state: {
    extensionsInfo: [],
    installStatuses: [],
    uninstallStatuses: [],
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
    updateUninstallStatus(prevState: State, uninstallStatus: ProcessStatus) {
      const statusIndex = prevState.uninstallStatuses.findIndex(({ name }) => uninstallStatus.name === name);
      if (statusIndex > -1) {
        prevState.uninstallStatuses.splice(statusIndex, 1, uninstallStatus);
      } else {
        prevState.uninstallStatuses.push(uninstallStatus);
      }
    },
    removeUninstallStatus(prevState: State, uninstallStatus: ProcessStatus) {
      const statusIndex = prevState.uninstallStatuses.findIndex(({ name }) => uninstallStatus.name === name);
      if (statusIndex > -1) {
        prevState.uninstallStatuses.splice(statusIndex, 1);
      }
    },
  },
  effects: () => ({
    async getIDEExtensionsInfo() {
      const extensionsInfo = await ipcRenderer.invoke('get-IDE-extensions-info');
      this.setState({ extensionsInfo });
    },
  }),
};
