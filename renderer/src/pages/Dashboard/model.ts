import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    basePackagesList: [],
    isInstalling: false,
    installPackagesList: [],
    currentStep: 0,
    pkgInstallStep: 0,
    pkgInstallStatuses: [],
  },
  reducers: {
    updateBasePackagesList(prevState, basePackagesList: IBasePackage[]) {
      prevState.basePackagesList = basePackagesList;
    },

    updateInstallStatus(prevState, isInstalling: boolean) {
      prevState.isInstalling = isInstalling;
    },

    updateInstallPackagesList(prevState, installPackagesList: IBasePackage[]) {
      prevState.installPackagesList = installPackagesList;
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

    initStep(prevState, installPackagesList: IBasePackage[]) {
      // skip the start step
      prevState.currentStep = 1;
      prevState.pkgInstallStep = 0;
      prevState.pkgInstallStatuses = installPackagesList.map((item: IBasePackage) => ({ name: item.name, status: 'wait' }));
      prevState.installPackagesList = installPackagesList;
    },
  },
  effects: (dispatch) => ({
    async getBasePackages() {
      const data = await ipcRenderer.invoke('get-base-packages-info');
      dispatch.dashboard.updateBasePackagesList(data);
      const packagesList = data.filter((basePackage: IBasePackage) => {
        return basePackage.versionStatus !== 'installed';
      });
      dispatch.dashboard.updateInstallPackagesList(packagesList);
    },
  }),
};
