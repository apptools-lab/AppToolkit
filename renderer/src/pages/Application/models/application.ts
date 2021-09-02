import { PackageInfo, ProcessStatus } from '@/interfaces/base';
import { ipcRenderer } from 'electron';

interface State {
  appsInfo: PackageInfo[];
  installStatuses: ProcessStatus[];
  uninstallStatuses: ProcessStatus[];
  detailVisible: boolean;
  currentAppInfo: PackageInfo;
}

export default {
  state: {
    appsInfo: [],
    installStatuses: [],
    uninstallStatuses: [],
    detailVisible: false,
    currentAppInfo: {},
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
    updateUninstallStatus(prevState: State, uninstallStatus: ProcessStatus) {
      const statusIndex = prevState.uninstallStatuses.findIndex(({ id }) => uninstallStatus.id === id);
      if (statusIndex > -1) {
        prevState.uninstallStatuses.splice(statusIndex, 1, uninstallStatus);
      } else {
        prevState.uninstallStatuses.push(uninstallStatus);
      }
    },
    removeUninstallStatus(prevState: State, uninstallStatus: ProcessStatus) {
      const statusIndex = prevState.uninstallStatuses.findIndex(({ id }) => uninstallStatus.id === id);
      if (statusIndex > -1) {
        prevState.uninstallStatuses.splice(statusIndex, 1);
      }
    },
    setDetailVisible(prevState: State, detailVisible: boolean) {
      prevState.detailVisible = detailVisible;
    },
    setCurrentAppInfo(prevState: State, appInfo: PackageInfo) {
      prevState.currentAppInfo = appInfo;
    },
  },
  effects: () => ({
    async getAppsInfo() {
      const appsInfo = await ipcRenderer.invoke('get-apps-info');
      this.setState({ appsInfo });
    },
  }),
};
