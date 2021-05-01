import { IBasePackage } from '@/interfaces';
import { ipcRenderer } from 'electron';

export default {
  state: {
    basePackagesList: [],
    isInstalling: false,
    installPackagesList: [],
    currentStep: 0,
    stepsStatus: [],
    installErrMsg: [],
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
    updateCurrentStep(prevState, currentStep) {
      prevState.currentStep = currentStep;
    },
    updateStepStatus(prevState, { currentStep, status }) {
      const modifiedStepsStatus = [...prevState.stepsStatus];
      modifiedStepsStatus[currentStep] = status;
      prevState.stepsStatus = modifiedStepsStatus;
    },
    initStepStatus(prevState, payload: number) {
      // start step + install steps + result step
      prevState.stepsStatus = ['finish'].concat(Array.from({ length: payload }, () => 'wait')).concat(['wait']);
      // skip the start step
      prevState.currentStep = 1;
      prevState.installErrMsg = [];
    },
    setInstallErrMsg(prevState, errMsg: string[]) {
      prevState.installErrMsg = errMsg;
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
