/** Git */
export type GitConfig = Record<string, string>;

/** Tool */
/** 安装包类型 */
type PackageType = 'dmg' | 'exe' | 'vsix' | 'npmPackage';
/** 工具类型 */
type ToolType = 'cli' | 'npmPackage' | 'macApp' | 'windowsApp' | 'vscodeExt';
interface ToolInfo {
  name: string;
  id: string;
  description: string;
  icon: string;
  link: string;
  packageType: PackageType;
  type: ToolType;
  downloadLink: string;
  version: string;
  categories: string[];
}
interface LocalToolInfo {
  installed: boolean;
  localPath?: string | null;
  localVersion?: string | null;
}
export type ToolsInfo = Record<NodeJS.Platform, ToolInfo[]>;

/** IPC APIs */
interface GitAPI {
  getGlobalGitConfig: () => Promise<GitConfig>;
  setGlobalGitConfig: (config: GitConfig) => Promise<void>;
}
interface CommonAPI {
  openFile: () => Promise<undefined | string>;
  getPlatform: () => NodeJS.Platform;
  // window resize api in win32
  setMin: () => void;
  setMax: () => boolean;
  setClose: () => void;
}

interface ToolAPI {
  getRecommendedToolsInfo: () => Promise<ToolsInfo[]>;
}
export interface IElectronAPI extends GitAPI, CommonAPI, ToolAPI {
}