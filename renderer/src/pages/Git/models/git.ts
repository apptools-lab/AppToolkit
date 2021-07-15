import { ipcRenderer } from 'electron';

export default {
  state: {
    globalGitConfig: {},
  },
  effects: () => ({
    async getGlobalGitConfig() {
      const globalGitConfig = await ipcRenderer.invoke('get-git-config');
      this.setState({ globalGitConfig });
    },
    async setGlobalGitConfig(gitConfig: any) {
      await ipcRenderer.invoke('set-git-config', { gitConfig });
    },
    async getUserGitConfig(configWorkspaceDir: string) {
      const gitconfig = await ipcRenderer.invoke('get-git-config', configWorkspaceDir);
      // dispatch.node.updateNodeInfo(nodeInfo);
    },
  }),
};
