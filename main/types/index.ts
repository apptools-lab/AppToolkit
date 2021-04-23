export interface IBasicPackageInfo {
  title: string;
  name: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  shellPath?: string;
  version: string | null;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
  platform: Platform;
  options?: {
    [k: string]: any;
  };
}

export type Platform = 'win32' | 'darwin';

export type PackageType = 'cmd' | 'dmg' | 'exe'| 'vscodeExtension'| 'chromeExtension' | 'npm';

export type VersionStatus = 'installed' | 'notInstalled' | 'upgradeable';

export interface ILocalPackageInfo {
  localVersion: string | null;
  localPath: string | null;
  versionStatus: VersionStatus;
  warningMessage?: string;
  [key: string]: any;
}
export interface INodeVersionManagerInfo {
  managerPath: string | null;
  managerVersion: string | null;
}

export interface IPackageInfo extends IBasicPackageInfo, ILocalPackageInfo {}
