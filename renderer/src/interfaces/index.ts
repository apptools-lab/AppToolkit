export interface IAppCard {
  name: string;
  description: string;
  icon: string;
  recommended?: boolean;
  versionStatus: keyof typeof VersionStatus;
  showSplitLine?: boolean;
  wanringMessage?: string;
}

export interface IBasePackage {
  name: string;
  title: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  shellPath?: string;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
  platform: Platform;
  version: string | null;
  path: string | null;
  versionStatus: keyof typeof VersionStatus;
  localVersion: string | null;
  localPath: string | null;
  warningMessage?: string;
  options?: { [key: string]: any };
  [key: string]: any;
}

export type Platform = 'win32' | 'darwin';

export type PackageType = 'cmd' | 'dmg' | 'exe'| 'vscodeExtension'| 'chromeExtension' | 'npm';

export enum VersionStatus {
  'installed' = '已安装',
  'notInstalled' = '未安装',
  'upgradeable' = '可升级'
}
