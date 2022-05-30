export type GitConfig = Record<string, string>;

type System = 'win32' | 'darwin';
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
  category?: string;
}

interface LocalToolInfo {
  installed: boolean;
  localPath?: string | null;
  localVersion?: string | null;
}

interface ToolData {
  [k in System]: ToolInfo;
}

/** APIs */
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
  getToolsInfo: () => Promise<ToolInfo>;
}

export interface IElectronAPI extends GitAPI, CommonAPI, ToolAPI {
}