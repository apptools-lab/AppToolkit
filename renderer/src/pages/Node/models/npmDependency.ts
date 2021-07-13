import { ipcRenderer } from 'electron';

const curDepIndexMap = {
  install: 'curInstallDepIndex',
  update: 'curUpdateDepIndex',
  reinstall: 'curReinstallDepIndex',
  uninstall: 'curUninstallDepIndex',
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
  },
  effects: () => ({
    async getGlobalNpmDependencies() {
      const npmDependencies = await ipcRenderer.invoke('get-global-npm-dependencies');
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
  }),
};
