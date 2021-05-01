import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    basePackagesList: [],
    isInstalling: false,
    installPackagesList: [],
    currentStep: 0,
    stepsStatus: [],
  },
  reducers: {
    updateBasePackagesList(prevState, payload: IBasePackage[]) {
      prevState.basePackagesList = payload;
    },
    updateInstallStatus(prevState, payload: boolean) {
      prevState.isInstalling = payload;
    },
    updateInstallPackagesList(prevState, payload: IBasePackage[]) {
      prevState.installPackagesList = payload;
    },
    updateCurrentStep(prevState, { currentIndex, status }) {
      prevState.currentStep = currentIndex;
      const modifiedStepsStatus = [...prevState.stepsStatus];
      modifiedStepsStatus[currentIndex] = status;
      prevState.stepsStatus = modifiedStepsStatus;
    },
    initStepStatus(prevState, payload: number) {
      prevState.currentStep = 1;
      prevState.stepsStatus = ['finish'].concat(Array.from({ length: payload }, () => 'wait'));
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
