import { ipcRenderer } from 'electron';

export default {
  state: {
    globalGitConfig: {},
    userGitConfigs: [],
    userGitConfigFormVisible: false,
    userGitConfigFormType: '',
  },
  reducers: {
    setUserGitConfigFormVisible(prevState, visible: boolean) {
      prevState.userGitConfigFormVisible = visible;
    },
    setUserGitConfigFormType(prevState, userGitConfigFormType: string) {
      prevState.userGitConfigFormType = userGitConfigFormType;
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
    async updateUserGitConfig({ originGitConfig, currentGitConfig }) {
      await ipcRenderer.invoke('update-user-git-config', originGitConfig, currentGitConfig);
      return true;
    },
    async removeUserGitConfig({ gitConfigPath, gitDir }: { gitDir: string; gitConfigPath: string }) {
      await ipcRenderer.invoke('remove-user-git-config', gitDir, gitConfigPath);
      return true;
    },
  }),
};
