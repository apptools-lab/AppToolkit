export type GitConfig = Record<string, string>;

interface GitAPI {
  getGlobalGitConfig: () => Promise<GitConfig>;

  setGlobalGitConfig: (config: GitConfig) => Promise<void>;
}

interface CommonAPI {
  openFile: () => Promise<undefined | string>;

  getPlatform: () => NodeJS.Platform;

  setMin: () => void;
}

export interface IElectronAPI extends
  GitAPI,
  CommonAPI {
}

