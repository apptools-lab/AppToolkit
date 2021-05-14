export interface IBasePackageInfo {
  title: string;
  name: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  shellName?: string;
  version: string | null;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
  platform?: Platform;
  options?: {
    [k: string]: any;
  };
}

export type Platform = 'win32' | 'darwin';

export type PackageType = 'cli' | 'dmg' | 'exe'| 'IDEExtension' | 'npm';

export type VersionStatus = 'installed' | 'uninstalled' | 'upgradeable';

export interface ILocalPackageInfo {
  localVersion: string | null;
  versionStatus: VersionStatus;
  localPath?: string | null;
  warningMessage?: string;
  [key: string]: any;
}
export interface INodeVersionManagerInfo {
  managerPath: string | null;
  managerVersion: string | null;
}

export interface IPackageInfo extends IBasePackageInfo, ILocalPackageInfo {}

export interface IPackageIntaller {
  install: (packageInfo: IPackageInfo, packagePath?: string) => void;
}
