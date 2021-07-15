import { ipcRenderer } from 'electron';

export default {
  state: {
    globalGitConfig: {},
    userGitConfigs: [],
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
    async setUserGitConfig({ gitConfigPath, gitConfig }: { gitConfigPath: string; gitConfig: any }) {
      await ipcRenderer.invoke('set-git-config', gitConfig, gitConfigPath);
    },
  }),
};
