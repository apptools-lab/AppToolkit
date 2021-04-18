export interface IBasePackageInfo {
  title: string;
  name: string;
  managerName?: string;
  description: string;
  icon: string;
  downloadUrl: string;
  version: string;
  recommended: boolean;
  isInternal: boolean;
  type: PackageType;
}

export type PackageType = 'tool' | 'app' | 'node';

export type VersionStatus = 'installed' | 'notInstalled' | 'upgradeable';

export interface ILocalPackageInfo {
  localVersion: string | null;
  localPath: string | null;
  installStatus: VersionStatus;
  warningMessage?: string;
}
