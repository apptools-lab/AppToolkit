import { IBasePackage, IInstallResultData } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    basePackagesList: [],
    isInstalling: false,
    uninstalledPackagesList: [],
    selectedInstalledPackagesList: [],
    currentStep: 0,
    pkgInstallStep: 0,
    pkgInstallStatuses: [],
    installResult: [],
  },
  reducers: {
    updateBasePackagesList(prevState, basePackagesList: IBasePackage[]) {
      prevState.basePackagesList = basePackagesList;
    },

    updateInstallStatus(prevState, isInstalling: boolean) {
      prevState.isInstalling = isInstalling;
    },

    updateUninstalledPackagesList(prevState, uninstalledPackagesList: IBasePackage[]) {
      prevState.uninstalledPackagesList = uninstalledPackagesList;
    },

    updateCurrentStep(prevState, step: number) {
      prevState.currentStep = step;
    },

    updatePkgInstallStep(prevState, step: number) {
      prevState.pkgInstallStep = step;
    },

    updatePkgInstallStepStatus(prevState, { step, status }) {
      prevState.pkgInstallStatuses[step].status = status;
    },

    initStep(prevState, selectedInstalledPackagesList: IBasePackage[]) {
      // skip the start step
      prevState.currentStep = 1;
      prevState.pkgInstallStep = 0;
      prevState.pkgInstallStatuses = selectedInstalledPackagesList.map((item: IBasePackage) => ({ name: item.name, status: 'wait' }));
      prevState.selectedInstalledPackagesList = selectedInstalledPackagesList;
      prevState.installResult = [];
    },

    updateInstallResult(prevState, installResult: IInstallResultData[]) {
      prevState.installResult = installResult;
    },
  },
  effects: (dispatch) => ({
    async getBasePackages() {
      const data = await ipcRenderer.invoke('get-base-packages-info');
      dispatch.dashboard.updateBasePackagesList(data);
      const packagesList = data.filter((basePackage: IBasePackage) => {
        return basePackage.versionStatus !== 'installed';
      });
      dispatch.dashboard.updateUninstalledPackagesList(packagesList);
    },

    async clearCaches({ processChannel, installChannel }) {
      await ipcRenderer.invoke('clear-base-packages-install-cache', { processChannel, installChannel });
    },

    async getCaches({ processChannel, installChannel }) {
      const { processCaches } = await ipcRenderer.invoke(
        'get-node-install-cache',
        { processChannel, installChannel },
      );

      if (Array.isArray(processCaches)) {
        processCaches.forEach(({ currentIndex, status, result }) => {
          if (status === 'done') {
            dispatch.dashboard.updateCurrentStep(2);
            dispatch.dashboard.updateInstallResult(result);
          } else {
            dispatch.dashboard.updatePkgInstallStepStatus({ status, step: currentIndex });
          }
        });
      }
    },
  }),
};
