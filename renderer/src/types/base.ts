export interface PackageInfo {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
  version: string | null;
  path: string | null;
  versionStatus: keyof typeof VersionStatus;
  localVersion: string | null;
  localPath: string | null;
  images?: string[];
  intro?: string | string[] | Array<{ title: string; content: string }>;
  platforms?: Platforms;
  downloadUrl?: string;
  shellName?: string;
  packagePath?: string;
  warningMessage?: string;
  options?: { [key: string]: any };
}

export interface NodeInfo extends PackageInfo {
  managerVersionStatus: keyof typeof VersionStatus;
}

export type Platforms = ['darwin', 'win32'];

export type PackageType = 'cli' | 'dmg' | 'exe' | 'vscodeExtension' | 'chromeExtension' | 'npm';

export enum VersionStatus {
  'installed' = '已安装',
  'uninstalled' = '未安装',
  'upgradeable' = '可升级'
}

export interface InstallResultData {
  status: 'error' | 'finish';
  title: string;
  duration: number;
  errMsg?: string;
}

export interface ProcessStatus {
  status: string;
  id: string;
  currentIndex?: number;
  result?: any;
  errMsg?: string;
  packagePath?: string;
}
