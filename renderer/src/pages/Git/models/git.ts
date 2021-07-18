import { ipcRenderer } from 'electron';

export default {
  state: {
    globalGitConfig: {},
    userGitConfigs: [],
    userGitConfigFormVisible: false,
  },
  reducers: {
    setUserGitConfigFormVisible(prevState, visible: boolean) {
      prevState.userGitConfigFormVisible = visible;
    },
  },
  effects: () => ({
    async getGlobalGitConfig() {
      const globalGitConfig = await ipcRenderer.invoke('get-global-git-config');
      this.setState({ globalGitConfig });
    },
    async setGlobalGitConfig(gitConfig: any) {
      await ipcRenderer.invoke('set-git-config', gitConfig);
    },
    async getUserGitConfigs() {
      const userGitConfigs = await ipcRenderer.invoke('get-user-git-configs');
      this.setState({ userGitConfigs });
    },
    async addUserGitConfig({ name, gitDir }: { name: string; gitDir: string }) {
      await ipcRenderer.invoke('add-user-git-config', name, gitDir);
      return true;
    },
    async setUserGitConfig({ gitConfigPath, gitConfig }: { gitConfigPath: string; gitConfig: any }) {
      await ipcRenderer.invoke('set-git-config', gitConfig, gitConfigPath);
      return true;
    },
    // TODO: rename to updateUserGitDir
    async updateUserGitDir({ originGitDir, currentGitDir }) {
      await ipcRenderer.invoke('update-user-git-dir', originGitDir, currentGitDir);
      return true;
    },
    async removeUserGitConfig({ gitConfigPath, gitDir }: { gitDir: string; gitConfigPath: string }) {
      await ipcRenderer.invoke('remove-user-git-config', gitDir, gitConfigPath);
      return true;
    },
    async getFolderPath() {
      return await ipcRenderer.invoke('get-folder-path');
    },
  }),
};
