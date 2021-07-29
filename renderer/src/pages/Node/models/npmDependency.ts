import { ipcRenderer } from 'electron';

const curDepIndexMap = {
  install: 'curInstallDepIndex',
  update: 'curUpdateDepIndex',
  reinstall: 'curReinstallDepIndex',
  uninstall: 'curUninstallDepIndex',
};

const defaultProcess = {
  percent: 0,
  message: '',
};

export default {
  state: {
    npmDependencies: [],
    curInstallDepIndex: [],
    curUpdateDepIndex: [],
    curReinstallDepIndex: [],
    curUninstallDepIndex: [],
    searchValue: '',
    queryNpmDependencies: [],
    globalDependenciesInfo: {
      recommendedPath: '',
      currentPath: '',
      exists: false,
    },
    customGlobalDepsDialogVisible: false,
    customGlobalDepsProcess: defaultProcess,
  },
  reducers: {
    addCurDepIndex(prevState, { type, index }: { type: string; index: number }) {
      prevState[curDepIndexMap[type]].push(index);
    },
    removeCurDepIndex(prevState, { type, index }: { type: string; index: number }) {
      const depIndex = prevState[curDepIndexMap[type]].findIndex((i: number) => i === index);
      prevState[curDepIndexMap[type]].splice(depIndex, 1);
    },
    updateSearchValue(prevState, searchValue: string) {
      prevState.searchValue = searchValue;
    },
    setCustomGlobalDepsDialogVisible(prevState, visible: boolean) {
      prevState.customGlobalDepsDialogVisible = visible;
    },
    setCustomGlobalDepsProcess(prevState, data) {
      prevState.customGlobalDepsProcess = data;
    },
  },
  effects: () => ({
    async getGlobalNpmDependencies(force = false) {
      const npmDependencies = await ipcRenderer.invoke('get-global-npm-dependencies', force);
      this.setState({ npmDependencies });
    },

    async uninstallGlobalNpmDependency(dependency: string) {
      await ipcRenderer.invoke('uninstall-global-npm-dependency', dependency);
    },

    async updateGlobalNpmDependency(dependency: string) {
      await ipcRenderer.invoke('update-global-npm-dependency', dependency);
    },

    async reinstallGlobalNpmDependency({ dependency, version }: {dependency: string; version: string}) {
      await ipcRenderer.invoke('reinstall-global-npm-dependency', dependency, version);
    },

    async installGlobalNpmDependency({ dependency, version }: { dependency: string; version: string }) {
      await ipcRenderer.invoke('install-global-npm-dependency', dependency, version);
    },

    async searchNpmDependencies(query: string) {
      const queryNpmDependencies = await ipcRenderer.invoke('search-npm-dependencies', query);
      this.setState({ queryNpmDependencies });
    },

    async getGlobalDependenciesPath() {
      const globalDependenciesInfo = await ipcRenderer.invoke('get-global-dependencies-info');
      this.setState({
        globalDependenciesInfo,
      });
    },

    async createCustomGlobalDepsDir({ channel, currentGlobalDepsPath }: { channel: string; currentGlobalDepsPath: string }) {
      await ipcRenderer.invoke('create-custom-global-dependencies-dir', channel, currentGlobalDepsPath);
    },
  }),
};
