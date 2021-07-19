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
    async updateGlobalGitConfig(gitConfig: any) {
      await ipcRenderer.invoke('update-global-git-config', gitConfig);
    },
    async getUserGitConfigs() {
      const userGitConfigs = await ipcRenderer.invoke('get-user-git-configs');
      this.setState({ userGitConfigs });
    },
    async addUserGitConfig({ name, gitDir }: { name: string; gitDir: string }) {
      await ipcRenderer.invoke('add-user-git-config', name, gitDir);
      return true;
    },
    async updateUserGitConfig(
      {
        gitConfigPath,
        currentGitConfig,
        configName,
      }: {
        gitConfigPath: string;
        configName: string;
        currentGitConfig: any;
      },
    ) {
      await ipcRenderer.invoke('update-user-git-config', currentGitConfig, configName, gitConfigPath);
      return true;
    },
    async updateUserGitDir({ originGitDir, currentGitDir }) {
      await ipcRenderer.invoke('update-user-git-dir', originGitDir, currentGitDir);
      return true;
    },
    async removeUserGitConfig(
      { configName, gitConfigPath, gitDir }: { configName: string; gitDir: string; gitConfigPath: string },
    ) {
      await ipcRenderer.invoke('remove-user-git-config', configName, gitDir, gitConfigPath);
      return true;
    },
    async getFolderPath() {
      return await ipcRenderer.invoke('get-folder-path');
    },
    async generateSSHKey({
      userEmail,
      configName,
      hostName,
      userName,
    }: {
      userEmail: string;
      configName: string;
      hostName: string;
      userName: string;
    }) {
      await ipcRenderer.invoke('generate-ssh-key', { userEmail, configName, hostName, userName });
      return true;
    },
  }),
};
