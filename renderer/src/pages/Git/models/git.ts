import { ipcRenderer } from 'electron';

export default {
  state: {
    globalGitConfig: {},
    userGitConfigs: [],
    userGitConfigFormVisible: false,
    existedUserGitConfigNames: [],
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

    async updateGlobalGitConfig(gitConfig: any) {
      await ipcRenderer.invoke('update-global-git-config', gitConfig);
    },

    async getUserGitConfigs() {
      const userGitConfigs = await ipcRenderer.invoke('get-user-git-configs');
      this.setState({ userGitConfigs });
    },

    async addUserGitConfig(gitConfig: any) {
      await ipcRenderer.invoke('add-user-git-config', gitConfig);
      return true;
    },

    async updateUserGitConfig(
      {
        gitConfig,
        configName,
      }: {
        configName: string;
        gitConfig: any;
      },
    ) {
      await ipcRenderer.invoke('update-user-git-config', gitConfig, configName);
      return true;
    },

    async updateUserGitDir({ originGitDir, currentGitDir }) {
      await ipcRenderer.invoke('update-user-git-dir', originGitDir, currentGitDir);
      return true;
    },

    async removeUserGitConfig(
      { configName, gitDir }: { configName: string; gitDir: string },
    ) {
      await ipcRenderer.invoke('remove-user-git-config', configName, gitDir);
      return true;
    },

    async getExistedUserGitConfigs() {
      const existedUserGitConfigNames = await ipcRenderer.invoke('get-existed-user-git-config-names');
      this.setState({ existedUserGitConfigNames });
    },

    async getFolderPath() {
      return await ipcRenderer.invoke('get-folder-path');
    },

    async generateSSHKey({
      userEmail,
      configName,
    }: {
      userEmail: string;
      configName: string;
    }) {
      const { pubKey } = await ipcRenderer.invoke('generate-ssh-key', configName, userEmail);
      return pubKey;
    },
  }),
};
