export interface PackageInfo {
  name: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  downloadUrl?: string;
  shellName?: string;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
  platforms?: Platforms;
  version: string | null;
  path: string | null;
  versionStatus: keyof typeof VersionStatus;
  localVersion: string | null;
  localPath: string | null;
  warningMessage?: string;
  options?: { [key: string]: any };
  [key: string]: any;
}

export type Platforms = ['darwin', 'win32'];

export type PackageType = 'cli' | 'dmg' | 'exe' | 'vscodeExtension' | 'chromeExtension' | 'npm';

export enum VersionStatus {
  'installed' = '已安装',
  'uninstalled' = '未安装',
  'upgradeable' = '可升级'
}

export interface IInstallResultData {
  status: 'error' | 'finish';
  title: string;
  duration: number;
  errMsg?: string;
}
